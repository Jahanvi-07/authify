/**
 * Frontend for Task 3
 * - Works with HTML ids in public/index.html
 * - Uses backend endpoints in server.js
 */

/* ---------- Configuration ---------- */
const API_BASE = '/api';
const ENDPOINTS = {
  register: `${API_BASE}/auth/register`,
  login: `${API_BASE}/auth/login`,
  items: `${API_BASE}/items`
};

const TOKEN_KEY = 'auth_token';

/* ---------- Helpers ---------- */
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const opts = { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options };
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : (data?.error || data?.message || 'Request failed');
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

function setWhoAmI(username) {
  const p = document.getElementById('whoami');
  if (p) p.textContent = username ? `Logged in as ${username}` : '';
}

/* ---------- Auth flows ---------- */
async function registerUser(form) {
  const username = document.getElementById('auth-username')?.value || '';
  const password = document.getElementById('auth-password')?.value || '';
  const payload = { username, password };
  const data = await fetchJson(ENDPOINTS.register, { method: 'POST', body: JSON.stringify(payload) });
  if (data.token) setAuthToken(data.token);
  setWhoAmI(data?.user?.username || username);
  await loadItems();
}

async function loginUser(form) {
  const username = document.getElementById('auth-username')?.value || '';
  const password = document.getElementById('auth-password')?.value || '';
  const payload = { username, password };
  const data = await fetchJson(ENDPOINTS.login, { method: 'POST', body: JSON.stringify(payload) });
  if (data.token) setAuthToken(data.token);
  setWhoAmI(data?.user?.username || username);
  await loadItems();
}

function logout() {
  setAuthToken(null);
  setWhoAmI('');
  clearItems();
}

/* ---------- Items CRUD ---------- */
async function loadItems() {
  const ul = document.getElementById('list');
  if (!ul) return;
  ul.innerHTML = '';
  try {
    const items = await fetchJson(ENDPOINTS.items, { method: 'GET', headers: authHeaders() });
    renderItems(items);
  } catch (e) {
    ul.innerHTML = '';
  }
}

function clearItems() {
  const ul = document.getElementById('list');
  if (ul) ul.innerHTML = '';
}

function renderItems(items = []) {
  const ul = document.getElementById('list');
  if (!ul) return;
  ul.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.textContent = 'No items yet.';
    ul.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item.name + (item.description ? ` — ${item.description}` : '');

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this item?')) return;
      try {
        await fetchJson(`${ENDPOINTS.items}/${encodeURIComponent(item._id)}`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        li.remove();
      } catch {}
    });
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function createItem(form) {
  const name = document.getElementById('name')?.value || '';
  const description = document.getElementById('description')?.value || '';
  const payload = { name, description };
  await fetchJson(ENDPOINTS.items, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  form.reset();
    await loadItems();
}

/* ---------- Wiring ---------- */
function bindUI() {
  const authForm = document.getElementById('auth-form');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await loginUser(authForm); } catch (err) { alert(err.message || 'Login failed'); }
    });
  }
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      try { await registerUser(authForm); } catch (err) { alert(err.message || 'Registration failed'); }
    });
  }

  const createForm = document.getElementById('create-form');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await createItem(createForm); } catch (err) { alert(err.message || 'Create failed'); }
    });
  }
}

async function init() {
  bindUI();
  const token = getAuthToken();
  if (token) {
    try {
      // try decode for username display
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      setWhoAmI(decoded?.username || '');
      await loadItems();
    } catch {}
  }
}

document.addEventListener('DOMContentLoaded', init);
