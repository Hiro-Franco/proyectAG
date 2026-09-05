let metodoPago = null;

if (!sessionStorage.getItem('token')) window.location.href = './html/login.html';

document.getElementById('btn-logout').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = './html/login.html';
});

window.setPago = function(btn) {
  metodoPago = btn.dataset.val;
  document.querySelectorAll('.toggle-btn').forEach(b => b.className = 'toggle-btn');
  btn.classList.add('active-' + metodoPago);
  document.getElementById('transferencia-extra').classList.toggle('hidden', metodoPago !== 'Transferencia');
};

document.getElementById('btn-continuar').addEventListener('click', () => {
  const razon     = document.getElementById('razon').value.trim();
  const categoria = document.getElementById('categoria').value;
  const errorEl   = document.getElementById('form-error');
  errorEl.classList.add('hidden');

  if (!razon)     { showError('Completá la razón social.');    return; }
  if (!categoria) { showError('Seleccioná una categoría.');    return; }

  const formData = {
    fecha:           document.getElementById('fecha').value,
    razonSocial:     razon,
    nombreComercial: document.getElementById('emisor').value.trim(),
    categoria,
    metodoPago:      metodoPago || '',
    banco:           document.getElementById('banco').value.trim(),
    cbu:             document.getElementById('cbu').value.trim(),
    notas:           document.getElementById('notas').value.trim(),
  };

  sessionStorage.setItem('formData', JSON.stringify(formData));
  window.location.href = './html/captura.html';
});

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

document.getElementById('fecha').value = new Date().toISOString().split('T')[0];