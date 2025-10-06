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

// ==========================================
// UTILIDADES
// ==========================================
const Utils = {
  /**
   * Muestra una alerta en la interfaz
   * @param {string} mensaje - Mensaje a mostrar
   * @param {string} tipo - Tipo de alerta (success, danger, warning)
   */
  mostrarAlerta(mensaje, tipo = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    elementos.alertContainer.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, CONFIG.ALERT_TIMEOUT);
  },

  /**
   * Scroll suave hacia el inicio de la página
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Valida el formulario usando la API de validación de HTML5
   * @param {HTMLFormElement} form - Formulario a validar
   * @returns {boolean} - True si el formulario es válido
   */
  validarFormulario(form) {
    form.classList.add('was-validated');
    return form.checkValidity();
  },

  /**
   * Crea una URL completa para la API
   * @param {string} endpoint - Endpoint de la API
   * @returns {string} - URL completa
   */
  crearURL(endpoint) {
    return `${CONFIG.API_URL}${endpoint}`;
  }
};

// ==========================================
// SERVICIO DE API
// ==========================================
const API = {
  /**
   * Obtiene todas las mascotas
   * @returns {Promise<Array>} - Array de mascotas
   */
  async obtenerMascotas() {
    const url = Utils.crearURL(CONFIG.ENDPOINTS.MASCOTAS);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener las mascotas');
    }
    
    return await response.json();
  },

  /**
   * Obtiene una mascota por ID
   * @param {number} id - ID de la mascota
   * @returns {Promise<Object>} - Datos de la mascota
   */
  async obtenerMascota(id) {
    const url = Utils.crearURL(`${CONFIG.ENDPOINTS.MASCOTA}/${id}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener la mascota');
    }
    
    return await response.json();
  },

  /**
   * Crea una nueva mascota
   * @param {FormData} formData - Datos del formulario
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async crearMascota(formData) {
    const url = Utils.crearURL(CONFIG.ENDPOINTS.MASCOTA);
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la mascota');
    }
    
    return await response.json();
  },

  /**
   * Actualiza una mascota existente
   * @param {number} id - ID de la mascota
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async actualizarMascota(id, data) {
    const url = Utils.crearURL(`${CONFIG.ENDPOINTS.MASCOTA}/${id}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la mascota');
    }
    
    return await response.json();
  },

  /**
   * Elimina una mascota
   * @param {number} id - ID de la mascota
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async eliminarMascota(id) {
    const url = Utils.crearURL(`${CONFIG.ENDPOINTS.MASCOTA}/${id}`);
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la mascota');
    }
    
    return await response.json();
  }
};