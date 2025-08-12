// ===== Currency
const fmtUSD = n => "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ===== Cart helpers
function getCartForCheckout(){
  if (window.cart && Array.isArray(window.cart) && window.cart.length) return window.cart;
  try {
    const raw = sessionStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ===== Render order on page
function renderOrder() {
  const items = getCartForCheckout();
  const itemsEl = document.getElementById("orderItems");
  const subEl   = document.getElementById("orderSubtotal");
  const totalEl = document.getElementById("orderTotal");
  if (!itemsEl) return;

  if (!items.length) {
    itemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
    if (subEl)   subEl.textContent = fmtUSD(0);
    if (totalEl) totalEl.textContent = fmtUSD(0);
    if (window.Swal) {
      Swal.fire({
        icon: 'info',
        title: 'Your cart is empty',
        text: 'Add some products before placing an order.',
        confirmButtonText: 'Back to Home'
      }).then(() => window.location.href = 'home.html');
    }
    return;
  }

  itemsEl.innerHTML = items.map(i => `
    <div class="order-item">
      <img src="${i.image}" alt="${i.name}">
      <div class="oi-name">${i.name} × ${i.qty}</div>
      <div class="oi-price">${fmtUSD(i.price * i.qty)}</div>
    </div>
  `).join("");

  const subtotal = items.reduce((s,i)=> s + i.price * i.qty, 0);
  if (subEl)   subEl.textContent = fmtUSD(subtotal);
  if (totalEl) totalEl.textContent = fmtUSD(subtotal);
}

// ===== Form validation
function getFieldByOrderOrName(form, index, name){
  const byName = form.querySelector(`[name="${name}"]`);
  if (byName) return byName;
  const list = form.querySelectorAll("input, select, textarea");
  return list[index] || null;
}

function collectFormData(){
  const form = document.getElementById("checkoutForm");
  if (!form) return { data: null, errors: ["Form not found"] };

  // Attempt to map fields by name first, else fallback to order
  const firstName = getFieldByOrderOrName(form, 0, "firstName");
  const lastName  = getFieldByOrderOrName(form, 1, "lastName");
  const address   = getFieldByOrderOrName(form, 2, "address");
  const city      = getFieldByOrderOrName(form, 3, "city");
  const zip       = getFieldByOrderOrName(form, 4, "zip");
  const phone     = getFieldByOrderOrName(form, 5, "phone");
  const email     = getFieldByOrderOrName(form, 6, "email");

  const fields = [
    { el:firstName, key:"First Name" },
    { el:lastName,  key:"Last Name"  },
    { el:address,   key:"Street address" },
    { el:city,      key:"Town / City" },
    { el:zip,       key:"ZIP code" },
    { el:phone,     key:"Phone" },
    { el:email,     key:"Email address" },
  ];

  const errors = [];
  fields.forEach(f => f.el?.classList.remove("invalid"));

  // Basic presence check
  for (const f of fields) {
    if (!f.el || !f.el.value || !String(f.el.value).trim()) {
      errors.push(`${f.key} is required`);
      f.el && f.el.classList.add("invalid");
    }
  }

  // Email format
  const emailVal = email?.value?.trim() || "";
  if (email && emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    errors.push("Invalid email address");
    email.classList.add("invalid");
  }

  // Phone digits (min 7)
  const phoneVal = (phone?.value || "").replace(/[^\d+]/g,"");
  if (phone && phoneVal.length < 7) {
    errors.push("Invalid phone number");
    phone.classList.add("invalid");
  }

  const data = {
    firstName: firstName?.value?.trim() || "",
    lastName : lastName?.value?.trim()  || "",
    address  : address?.value?.trim()   || "",
    city     : city?.value?.trim()      || "",
    zip      : zip?.value?.trim()       || "",
    phone    : phone?.value?.trim()     || "",
    email    : email?.value?.trim()     || ""
  };

  return { data, errors };
}

// ===== Place order flow
function summaryHTML(data, items){
  const lines = items.map(i => `
    <tr>
      <td style="padding:6px 0;">${i.name} × ${i.qty}</td>
      <td style="text-align:right; padding:6px 0;">${fmtUSD(i.price * i.qty)}</td>
    </tr>
  `).join("");
  const total = items.reduce((s,i)=> s + i.price * i.qty, 0);
  return `
    <div style="text-align:left">
      <h3 style="margin:0 0 8px; font-size:1.05rem;">Order Details</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <tbody>${lines}</tbody>
        <tfoot>
          <tr><td style="padding-top:8px; font-weight:700;">Total</td><td style="text-align:right; padding-top:8px; font-weight:800;">${fmtUSD(total)}</td></tr>
        </tfoot>
      </table>

      <h3 style="margin:10px 0 6px; font-size:1.05rem;">Billing</h3>
      <p style="margin:0 0 4px;">${data.firstName} ${data.lastName}</p>
      <p style="margin:0 0 4px;">${data.address}, ${data.city}, ${data.zip}</p>
      <p style="margin:0 0 4px;">📞 ${data.phone}</p>
      <p style="margin:0">✉️ ${data.email}</p>
      <p style="margin:8px 0 0; color:#6b7280;">Payment: Cash On Delivery</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderOrder);

document.getElementById("placeOrder")?.addEventListener("click", (e) => {
  e.preventDefault();

  const items = getCartForCheckout();
  if (!items.length) {
    Swal.fire({ icon:'info', title:'Your cart is empty', confirmButtonText:'Back to Home' })
      .then(()=> window.location.href='home.html');
    return;
  }

  const { data, errors } = collectFormData();
  if (errors.length) {
    Swal.fire({
      icon: 'error',
      title: 'Please fix the following',
      html: `<ul style="text-align:left; margin:0; padding-left:18px;">${errors.map(e=>`<li>${e}</li>`).join("")}</ul>`
    });
    return;
  }

  // Show summary & confirm
  Swal.fire({
    icon: 'success',
    title: 'Order placed!',
    html: summaryHTML(data, items),
    confirmButtonText: 'OK'
  }).then(() => {
    try { sessionStorage.removeItem("cart"); } catch {}
    window.location.href = 'home.html';
  });
});
