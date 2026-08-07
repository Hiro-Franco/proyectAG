const API_BASE = 'http://localhost:5000';

const token    = sessionStorage.getItem('token');
const formData = JSON.parse(sessionStorage.getItem('formData') || 'null');

if (!token)    window.location.href = 'login.html';
if (!formData) window.location.href = 'formulario.html';

const video          = document.getElementById('video');
const canvas         = document.getElementById('canvas');
const cameraWrap     = document.getElementById('camera-wrap');
const previewWrap    = document.getElementById('preview-wrap');
const previewImg     = document.getElementById('preview-img');
const processingWrap = document.getElementById('processing-wrap');
const resultWrap     = document.getElementById('result-wrap');
const successWrap    = document.getElementById('success-wrap');
const ocrGrid        = document.getElementById('ocr-grid');
const formSummary    = document.getElementById('form-summary');

let imagenBase64 = null;
let ocrData      = {};

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }
    });
    video.srcObject = stream;
  } catch (err) {
    alert('No se pudo acceder a la cámara. Verificá los permisos.');
  }
}

document.getElementById('btn-capture').addEventListener('click', () => {
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  imagenBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  previewImg.src = 'data:image/jpeg;base64,' + imagenBase64;
  video.srcObject.getTracks().forEach(t => t.stop());
  mostrar(previewWrap);
  ocultar(cameraWrap);
});

document.getElementById('btn-retomar').addEventListener('click', () => {
  ocultar(previewWrap);
  mostrar(cameraWrap);
  iniciarCamara();
});

document.getElementById('btn-procesar').addEventListener('click', async () => {
  ocultar(previewWrap);
  mostrar(processingWrap);
  try {
    const res = await fetch(`${API_BASE}/ocr/procesar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ imagen: imagenBase64 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al procesar la imagen.');
    ocrData = data;
    renderizarResultado();
  } catch (err) {
    alert('Error OCR: ' + err.message);
    ocultar(processingWrap);
    mostrar(cameraWrap);
    iniciarCamara();
  }
});

function renderizarResultado() {
  ocultar(processingWrap);

  const camposOcr = [
    { key: 'numero',        label: 'N° Factura'   },
    { key: 'fecha_factura', label: 'Fecha factura' },
    { key: 'cuit',          label: 'CUIT'          },
    { key: 'total',         label: 'Total'         },
    { key: 'descripcion',   label: 'Descripción'   },
  ];

  ocrGrid.innerHTML = '';
  camposOcr.forEach(({ key, label }) => {
    const div = document.createElement('div');
    div.className = 'ocr-item';
    div.innerHTML = `<label>${label}</label><input type="text" id="ocr-${key}" value="${ocrData[key] || ''}">`;
    ocrGrid.appendChild(div);
  });

  const camposForm = [
    { key: 'razonSocial',     label: 'Razón social'    },
    { key: 'nombreComercial', label: 'Nombre comercial' },
    { key: 'categoria',       label: 'Categoría'        },
    { key: 'metodoPago',      label: 'Método de pago'   },
    { key: 'banco',           label: 'Banco/entidad'    },
    { key: 'fecha',           label: 'Fecha emisión'    },
    { key: 'notas',           label: 'Notas'            },
  ];

  formSummary.innerHTML = '';
  camposForm.forEach(({ key, label }) => {
    if (!formData[key]) return;
    const div = document.createElement('div');
    div.className = 'form-summary-item';
    div.innerHTML = `<label>${label}</label><span>${formData[key]}</span>`;
    formSummary.appendChild(div);
  });

  mostrar(resultWrap);
}

document.getElementById('btn-guardar').addEventListener('click', async () => {
  const btnGuardar = document.getElementById('btn-guardar');
  const errorEl    = document.getElementById('result-error');
  errorEl.classList.add('hidden');
  btnGuardar.textContent = 'Guardando…';
  btnGuardar.disabled = true;

  const ocrFinal = {
    numero:        document.getElementById('ocr-numero')?.value        || '',
    fecha_factura: document.getElementById('ocr-fecha_factura')?.value || '',
    cuit:          document.getElementById('ocr-cuit')?.value          || '',
    total:         document.getElementById('ocr-total')?.value         || '',
    descripcion:   document.getElementById('ocr-descripcion')?.value   || '',
  };

  const payload = {
    ...formData, ...ocrFinal,
    usuario:   sessionStorage.getItem('username') || '',
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_BASE}/excel/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar.');
    sessionStorage.removeItem('formData');
    ocultar(resultWrap);
    mostrar(successWrap);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  } finally {
    btnGuardar.textContent = 'Guardar en Excel';
    btnGuardar.disabled = false;
  }
});

document.getElementById('btn-nueva').addEventListener('click', () => { window.location.href = 'formulario.html'; });
document.getElementById('btn-back').addEventListener('click',  () => { window.location.href = 'formulario.html'; });

function mostrar(el) { el.classList.remove('hidden'); }
function ocultar(el) { el.classList.add('hidden'); }

iniciarCamara();