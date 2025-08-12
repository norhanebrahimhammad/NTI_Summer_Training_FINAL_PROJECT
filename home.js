// ===== Mobile menu toggle
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('mainNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

// ===== Currency
const fmtUSD = n => "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ===== Products
const products = [{ id: "syltherine", name: "Syltherine", sub: "Stylish cafe chair", price: 2500, oldPrice: 3500, tag: { type: "sale", text: "-30%" }, image: "Images/image 1.png" }, 
  { id: "leviosa", name: "Leviosa", sub: "Stylish cafe chair", price: 2500, oldPrice: null, tag: null, image: "Images/image 2.png" },
   { id: "lolito", name: "Lolito", sub: "Luxury big sofa", price: 7000, oldPrice: 14000, tag: { type: "sale", text: "-50%" }, image: "Images/image 3.png" },
    { id: "respira", name: "Respira", sub: "Outdoor bar table and stool", price: 500, oldPrice: null, tag: { type: "new", text: "New" }, image: "Images/image 4.png" },
     { id: "syltherine", name: "Syltherine", sub: "Stylish cafe chair", price: 2500, oldPrice: 3500, tag: { type: "sale", text: "-30%" }, image: "Images/image 5.png" },
      { id: "leviosa", name: "Leviosa", sub: "Stylish cafe chair", price: 2500, oldPrice: null, tag: null, image: "Images/image 6.png" }, 
      { id: "lolito", name: "Lolito", sub: "Luxury big sofa", price: 7000, oldPrice: 14000, tag: { type: "sale", text: "-50%" }, image: "Images/image 7.png" },
       { id: "respira", name: "Respira", sub: "Outdoor bar table and stool", price: 500, oldPrice: null, tag: { type: "new", text: "New" }, image: "Images/image 8.png" },
        { id: "syltherine", name: "Syltherine", sub: "Stylish cafe chair", price: 2500, oldPrice: 3500, tag: { type: "sale", text: "-30%" }, image: "Images/image 8 (1).png" },
         { id: "leviosa", name: "Leviosa", sub: "Stylish cafe chair", price: 2500, oldPrice: null, tag: null, image: "Images/image 7 (1).png" },
          { id: "lolito", name: "Lolito", sub: "Luxury big sofa", price: 7000, oldPrice: 14000, tag: { type: "sale", text: "-50%" }, image: "Images/image 6 (1).png" },
           { id: "respira", name: "Respira", sub: "Outdoor bar table and stool", price: 500, oldPrice: null, tag: { type: "new", text: "New" }, image: "Images/Image 5 (1).png" }];
window.products = products;

function renderProducts(list) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = list.map(p => {
    const badge = p.tag?.type ? `<span class="p-badge ${p.tag.type}">${p.tag.text}</span>` : "";
    const old   = p.oldPrice ? `<span class="p-old">${fmtUSD(p.oldPrice)}</span>` : "";
    return `
    <article class="p-card" role="listitem" data-id="${p.id}">
      <div class="p-media">
        <img src="${p.image}" alt="${p.name}">
        ${badge}
        <div class="p-hover">
          <button class="btn-cart" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
      <div class="p-body">
        <h3 class="p-title">${p.name}</h3>
        <p class="p-sub">${p.sub}</p>
        <div class="p-price">
          <span>${fmtUSD(p.price)}</span>
          ${old}
        </div>
      </div>
    </article>`;
  }).join("");
}

// ===== Cart state
let cart = [];
try { const raw = sessionStorage.getItem("cart"); if (raw) cart = JSON.parse(raw) || []; } catch {}
window.cart = cart;

const cartBadge   = document.getElementById("cartCount");
const cartBtn     = document.querySelector(".icon-btn.cart");
const cartDrawer  = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose   = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartClear   = document.getElementById("cartClear");
const cartCheckout= document.getElementById("cartCheckout");

const toast = (window.Swal && Swal.mixin) ? Swal.mixin({
  toast:true, position:"top-end", timer:1200, showConfirmButton:false, timerProgressBar:true
}) : { fire: ()=>{} };

function persistCart(){ try{ sessionStorage.setItem("cart", JSON.stringify(cart)); }catch{} window.cart = cart; }
function updateBadge(){ const q = cart.reduce((s,i)=>s+i.qty,0); if(cartBadge) cartBadge.textContent = q; }
function openCart(){ if(!cartDrawer||!cartOverlay) return; cartDrawer.classList.add("open"); cartOverlay.hidden=false; requestAnimationFrame(()=>cartOverlay.classList.add("show")); }
function closeCart(){ if(!cartDrawer||!cartOverlay) return; cartDrawer.classList.remove("open"); cartOverlay.classList.remove("show"); setTimeout(()=>cartOverlay.hidden=true,200); }

function renderCart(){
  if (!cartItemsEl || !cartTotalEl) return;
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
    cartTotalEl.textContent = fmtUSD(0);
    return;
  }
  cartItemsEl.innerHTML = cart.map(i=>`
    <div class="ci" data-id="${i.id}">
      <img src="${i.image}" alt="${i.name}">
      <div>
        <p class="ci-title">${i.name}</p>
        <p class="ci-sub">${fmtUSD(i.price)} each</p>
        <div class="ci-qty">
          <button class="qminus" aria-label="Decrease">−</button>
          <span>${i.qty}</span>
          <button class="qplus" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="ci-right">${fmtUSD(i.price * i.qty)}</div>
    </div>
  `).join("");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartTotalEl.textContent = fmtUSD(total);
}

function addToCart(p){
  const f = cart.find(i=>i.id===p.id);
  if (f) f.qty += 1; else cart.push({id:p.id,name:p.name,price:p.price,image:p.image,qty:1});
  updateBadge(); renderCart(); persistCart();
  toast.fire({icon:"success", title:`Added: ${p.name}`});
}

function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i=>i.id!==id);
  updateBadge(); renderCart(); persistCart();
}

function clearCart(){ cart = []; updateBadge(); renderCart(); persistCart(); }

// Event hooks
cartBtn?.addEventListener("click", openCart);
cartOverlay?.addEventListener("click", closeCart);
cartClose?.addEventListener("click", closeCart);
cartClear?.addEventListener("click", clearCart);
cartCheckout?.addEventListener("click", ()=>{ persistCart(); window.location.href="checkout.html"; });

document.addEventListener("click", e=>{
  const add = e.target.closest(".btn-cart");
  if(add){
    const id = add.dataset.id;
    const p = products.find(x=>x.id===id);
    if(p){ addToCart(p); add.textContent="Added!"; setTimeout(()=>add.textContent="Add to cart", 1200); }
  }
  const ci = e.target.closest(".ci");
  if(ci){
    const id = ci.getAttribute("data-id");
    if (e.target.classList.contains("qplus")) changeQty(id, +1);
    if (e.target.classList.contains("qminus")) changeQty(id, -1);
  }
});

// ===== Rooms slider with autoplay
const rooms = [
  { img: "Images/Rectangle 25.png", label: "01 — Bed Room",   title: "Inner Peace" },
  { img: "Images/image 101.png", label: "02 — Dining Room",title: "Bright Minimal" },
  { img: "Images/image 8 (1).png", label: "03 — Living Room",title: "Warm Tones" }
];

function buildRoomsSlider(){
  const track = document.getElementById("roomsTrack");
  const dotsEl= document.getElementById("roomsDots");
  if(!track || !dotsEl) return;
  track.innerHTML = rooms.map((r,i)=>`
    <article class="r-slide" aria-roledescription="slide" aria-label="${i+1} of ${rooms.length}">
      <img src="${r.img}" alt="${r.title}">
      <div class="r-card">
        <small>${r.label}</small>
        <div style="display:flex;gap:10px;align-items:center;margin-top:4px">
          <h3>${r.title}</h3><span class="arrow">→</span>
        </div>
      </div>
    </article>
  `).join("");
  dotsEl.innerHTML = rooms.map((_,i)=>`<button class="r-dot" data-i="${i}" role="tab" aria-selected="${i===0}"></button>`).join("");
}

let rIndex=0, roomsTimer;
function roomsGo(i){
  const track = document.getElementById("roomsTrack");
  const dots = [...document.querySelectorAll(".r-dot")];
  if(!track || dots.length===0) return;
  const max = rooms.length - 1;
  rIndex = (i<0)?max:(i>max?0:i);
  const slideW = track.firstElementChild?.getBoundingClientRect().width || 0;
  track.style.transform = `translateX(${-rIndex * (slideW + 14)}px)`;
  dots.forEach((d,idx)=>{ d.classList.toggle("active", idx===rIndex); d.setAttribute("aria-selected", String(idx===rIndex)); });
}
function startRoomsAuto(){ stopRoomsAuto(); roomsTimer = setInterval(()=> roomsGo(rIndex+1), 4000); }
function stopRoomsAuto(){ if(roomsTimer) clearInterval(roomsTimer); }
function wireRoomsSlider(){
  const prev = document.getElementById("roomsPrev");
  const next = document.getElementById("roomsNext");
  const dots = document.getElementById("roomsDots");
  prev?.addEventListener("click", ()=>{ roomsGo(rIndex-1); startRoomsAuto(); });
  next?.addEventListener("click", ()=>{ roomsGo(rIndex+1); startRoomsAuto(); });
  dots?.addEventListener("click", (e)=>{ const b=e.target.closest(".r-dot"); if(b){ roomsGo(parseInt(b.dataset.i,10)); startRoomsAuto(); }});
  const slider = document.querySelector(".rooms-slider");
  slider?.addEventListener("mouseenter", stopRoomsAuto);
  slider?.addEventListener("mouseleave", startRoomsAuto);
  window.addEventListener("resize", ()=> roomsGo(rIndex));
}

// ===== Init
document.addEventListener("DOMContentLoaded", ()=>{
  renderProducts(products);
  updateBadge();
  renderCart();

  buildRoomsSlider();
  wireRoomsSlider();
  roomsGo(0);
  startRoomsAuto();
});


// ===== User popover (shown from account icon in header) =====
(function(){
  const accountBtn = document.querySelector('.actions .icon-btn[aria-label="Account"]');
  if (!accountBtn) return;
  // Create popover once
  let pop = document.getElementById('userPop');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'userPop';
    pop.className = 'user-pop';
    // Fake user data; replace with real auth data if available
    const user = { name: "Norhan", username: "norhan", email: "norhan@example.com", address: "123 Main St, City" };
    pop.innerHTML = `
      <div class="user-h">
        <img src="${user.avatar}" alt="${user.name}" class="user-ava-img" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
        <div>
          <h4>${user.name}</h4><p>@${user.username}</p>
          <p>${user.email}</p>
          <p style="color:var(--muted);font-size:13px;">${user.address}</p>
        </div>
      </div>
      <div class="user-links">
        <a href="#" role="button">Profile <span>›</span></a>
        <a href="#" role="button">Orders <span>›</span></a>
        <a href="#" role="button">Addresses <span>›</span></a>
        <button type="button" id="logoutBtn">Log out</button>
      </div>
      <div class="user-foot"><span>Signed in</span><time>${new Date().toLocaleDateString()}</time></div>
    `;
    document.body.appendChild(pop);
  }
  function togglePop(){
    pop.classList.toggle('show');
  }
  function closePop(e){
    if (!pop.classList.contains('show')) return;
    if (pop.contains(e.target)) return;
    if (accountBtn.contains(e.target)) return;
    pop.classList.remove('show');
  }
  accountBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    togglePop();
  });
  document.addEventListener('click', closePop);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') pop.classList.remove('show'); });

  // demo logout clears demo_user
  document.addEventListener('click', (e)=>{
    if (e.target && e.target.id === 'logoutBtn'){
      window.location.href = 'index.html';
    }
  });
})();
