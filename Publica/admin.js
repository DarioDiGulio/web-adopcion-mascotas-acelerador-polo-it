// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================
const CONFIG = {
  API_URL: 'https://misterio07.alwaysdata.net',
  ALERT_TIMEOUT: 5000,
  ENDPOINTS: {
    MASCOTAS: '/mascotas',
    MASCOTA: '/mascota'
  }
};

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
const appState = {
  modoEdicion: false,
  mascotaAEliminar: null
};

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const elementos = {
  form: document.getElementById('mascotaForm'),
  formContainer: document.getElementById('formContainer'),
  formTitle: document.getElementById('formTitle'),
  tablaMascotas: document.getElementById('tablaMascotas'),
  alertContainer: document.getElementById('alertContainer'),
  previewContainer: document.getElementById('previewContainer'),
  btnNuevaMascota: document.getElementById('btnNuevaMascota'),
  btnCancelar: document.getElementById('btnCancelar'),
  btnConfirmarEliminar: document.getElementById('confirmarEliminar'),
  inputFoto: document.getElementById('foto'),
  inputMascotaId: document.getElementById('mascotaId')
};