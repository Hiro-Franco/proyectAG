// =============================================
// login.js — autenticación de usuario
// =============================================

const API_BASE = 'http://localhost:5000';

// ---- Modo demo: usuarios locales para probar sin backend ----
// Cuando tengas el servidor listo, cambiá MODO_DEMO a false
const MODO_DEMO = true;

const USUARIOS_DEMO = [
  { username: 'admin',    password: 'admin123',    nombre: 'Administrador' },
  { username: 'operador', password: 'operador123', nombre: 'Operador'      },
];

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');
  const btnEl    = document.getElementById('btn-login');

  errorEl.classList.add('hidden');

  if (!username || !password) {
    showError('Completá usuario y contraseña.');
    return;
  }

  btnEl.textContent = 'Verificando…';
  btnEl.disabled = true;

  // ---- Autenticación local (sin servidor) ----
  if (MODO_DEMO) {
    await new Promise(r => setTimeout(r, 500));
    const usuario = USUARIOS_DEMO.find(u => u.username === username && u.password === password);
    if (!usuario) {
      showError('Usuario o contraseña incorrectos.');
      btnEl.textContent = 'Ingresar';
      btnEl.disabled = false;
      return;
    }
    sessionStorage.setItem('token', 'demo-token');
    sessionStorage.setItem('username', usuario.nombre);
    window.location.href = 'formulario.html';
    return;
  }

  // ---- Autenticación real contra el backend ----
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Usuario o contraseña incorrectos.');
      return;
    }

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', username);
    window.location.href = 'formulario.html';

  } catch (err) {
    showError('No se pudo conectar con el servidor.');
    console.error(err);
  } finally {
    btnEl.textContent = 'Ingresar';
    btnEl.disabled = false;
  }
}

function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

document.getElementById('btn-login').addEventListener('click', login);
document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

if (sessionStorage.getItem('token')) window.location.href = 'formulario.html';