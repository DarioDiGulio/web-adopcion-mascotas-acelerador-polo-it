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

// ==========================================
// COMPONENTES UI
// ==========================================
const UI = {
  /**
   * Crea el HTML de una fila de mascota para la tabla
   * @param {Object} mascota - Datos de la mascota
   * @returns {string} - HTML de la fila
   */
  crearFilaMascota(mascota) {
    const fotoHTML = mascota.foto_url
      ? `<img src="${mascota.foto_url}" alt="${mascota.nombre}" class="table-pet-img">`
      : '<span class="text-muted">Sin foto</span>';

    return `
      <tr>
        <td>${mascota.id}</td>
        <td>${fotoHTML}</td>
        <td>${mascota.nombre}</td>
        <td>${mascota.tipo}</td>
        <td>${mascota.raza}</td>
        <td>${mascota.edad}</td>
        <td>${mascota.direccion}</td>
        <td>${mascota.propietario}</td>
        <td class="text-center table-actions">
          <button class="btn btn-sm btn-warning" 
                  onclick="MascotaController.editarMascota(${mascota.id})" 
                  title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" 
                  onclick="MascotaController.confirmarEliminar(${mascota.id})" 
                  title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  /**
   * Renderiza la tabla de mascotas
   * @param {Array} mascotas - Array de mascotas
   */
  renderizarTabla(mascotas) {
    if (!mascotas || mascotas.length === 0) {
      elementos.tablaMascotas.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">No hay mascotas registradas</td>
        </tr>
      `;
      return;
    }

    elementos.tablaMascotas.innerHTML = mascotas
      .map(mascota => this.crearFilaMascota(mascota))
      .join('');
  },

  /**
   * Muestra el spinner de carga en la tabla
   */
  mostrarSpinner() {
    elementos.tablaMascotas.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>
    `;
  },

  /**
   * Muestra u oculta el formulario
   * @param {boolean} mostrar - True para mostrar, false para ocultar
   */
  toggleFormulario(mostrar) {
    if (mostrar) {
      elementos.formContainer.classList.remove('d-none');
      Utils.scrollToTop();
    } else {
      elementos.formContainer.classList.add('d-none');
    }
  },

  /**
   * Actualiza el título del formulario
   * @param {string} titulo - Título a mostrar
   * @param {string} icono - Clase del icono de Bootstrap
   */
  actualizarTituloFormulario(titulo, icono = 'bi-file-earmark-plus') {
    elementos.formTitle.innerHTML = `<i class="bi ${icono}"></i> ${titulo}`;
  },

  /**
   * Muestra la vista previa de una imagen
   * @param {File} file - Archivo de imagen
   */
  previsualizarImagen(file) {
    if (!file) {
      elementos.previewContainer.innerHTML = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      elementos.previewContainer.innerHTML = `
        <img src="${e.target.result}" class="preview-img" alt="Vista previa">
      `;
    };
    reader.readAsDataURL(file);
  }
};