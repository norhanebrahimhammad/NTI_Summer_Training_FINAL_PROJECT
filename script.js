// Toggle password visibility
const passInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePass');
toggleBtn.addEventListener('click', () => {
  const isHidden = passInput.type === 'password';
  passInput.type = isHidden ? 'text' : 'password';
  toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
});

// Simple auth check using SweetAlert2
const form = document.getElementById('login-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;

  if (!user || !pass) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing info',
      text: 'Please enter both username and password.'
    });
    return;
  }

  const isValid = (user === 'norhan' && pass === 'norhan');

  if (isValid) {
  await Swal.fire({
    icon: 'success',
    title: 'Login successful',
    text: 'Welcome, Norhan!',
    confirmButtonText: 'Continue'
  });
  window.location.href = "home.html"; // redirect to home page
} else {
  Swal.fire({
    icon: 'error',
    title: 'Invalid credentials',
    text: 'Username or password is incorrect.'
  });
}
});

// Demo password data
const userPasswords = {
  'norhan': 'norhan'
};

// Handle "Forgot password?" click
document.querySelector('.row').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  if (!username) {
    Swal.fire({
      icon: 'info',
      title: 'Enter username first',
      text: 'Please type your username so we can retrieve your password.'
    });
    return;
  }
  if (userPasswords[username]) {
    Swal.fire({
      icon: 'success',
      title: 'Password found',
      text: `Your password is: ${userPasswords[username]}`
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'User not found',
      text: 'No password stored for that username.'
    });
  }
});
