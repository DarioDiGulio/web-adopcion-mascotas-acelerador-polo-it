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
    // soporta FormData (multipart) o un plain object que será enviado como JSON
    const isFormData = (typeof FormData !== 'undefined') && (formData instanceof FormData);
    const options = { method: 'POST' };

    if (isFormData) {
      options.body = formData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(formData);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      // intentar leer el cuerpo de error para depuración
      let errBody = '';
      try {
        errBody = await response.text();
      } catch (e) {
        errBody = response.statusText;
      }
      throw new Error(`Error al crear la mascota: ${response.status} ${errBody}`);
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

// ==========================================
// CONTROLADOR DE FORMULARIO
// ==========================================
const FormController = {
  /**
   * Obtiene los datos del formulario
   * @returns {Object} - Datos del formulario
   */
  obtenerDatosFormulario() {
    return {
      nombre: document.getElementById('nombre').value.trim(),
      tipo: document.getElementById('tipo').value,
      raza: document.getElementById('raza').value.trim(),
      edad: document.getElementById('edad').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      propietario: document.getElementById('propietario').value.trim()
    };
  },

  /**
   * Rellena el formulario con datos de una mascota
   * @param {Object} mascota - Datos de la mascota
   */
  rellenarFormulario(mascota) {
    elementos.inputMascotaId.value = mascota.id;
    document.getElementById('nombre').value = mascota.nombre;
    document.getElementById('tipo').value = mascota.tipo;
    document.getElementById('raza').value = mascota.raza;
    document.getElementById('edad').value = mascota.edad;
    document.getElementById('direccion').value = mascota.direccion;
    document.getElementById('propietario').value = mascota.propietario;

    if (mascota.foto_url) {
      elementos.previewContainer.innerHTML = `
        <img src="${mascota.foto_url}" class="preview-img" alt="${mascota.nombre}">
      `;
    }
  },

  /**
   * Limpia el formulario
   */
  limpiarFormulario() {
    elementos.form.reset();
    elementos.form.classList.remove('was-validated');
    elementos.inputMascotaId.value = '';
    elementos.previewContainer.innerHTML = '';
  },

  /**
   * Prepara el formulario para crear una nueva mascota
   */
  prepararNuevaMascota() {
    this.limpiarFormulario();
    UI.actualizarTituloFormulario('Registrar Nueva Mascota', 'bi-file-earmark-plus');
    UI.toggleFormulario(true);
    appState.modoEdicion = false;
  },

  /**
   * Prepara el formulario para editar una mascota
   */
  prepararEdicion() {
    UI.actualizarTituloFormulario('Editar Mascota', 'bi-pencil');
    UI.toggleFormulario(true);
    appState.modoEdicion = true;
  },

  /**
   * Cancela la edición/creación
   */
  cancelar() {
    this.limpiarFormulario();
    UI.toggleFormulario(false);
    appState.modoEdicion = false;
  }
};

// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================
const MascotaController = {
  /**
   * Inicializa la aplicación
   */
  async init() {
    this.cargarMascotas();
    this.inicializarEventos();
  },

  /**
   * Inicializa los event listeners
   */
  inicializarEventos() {
    // Botón nueva mascota
    elementos.btnNuevaMascota.addEventListener('click', () => {
      FormController.prepararNuevaMascota();
    });

    // Botón cancelar
    elementos.btnCancelar.addEventListener('click', () => {
      FormController.cancelar();
    });

    // Preview de imagen
    elementos.inputFoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      UI.previsualizarImagen(file);
    });

    // Submit del formulario
    elementos.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarMascota();
    });

    // Botón confirmar eliminar
    elementos.btnConfirmarEliminar.addEventListener('click', () => {
      this.eliminarMascota();
    });
  },

  /**
   * Carga todas las mascotas desde la API
   */
  async cargarMascotas() {
    try {
      UI.mostrarSpinner();
      const mascotas = await API.obtenerMascotas();
      UI.renderizarTabla(mascotas);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Utils.mostrarAlerta('Error al cargar las mascotas', 'danger');
      elementos.tablaMascotas.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-danger">
            Error al cargar las mascotas
          </td>
        </tr>
      `;
    }
  },

  /**
   * Guarda una mascota (crear o actualizar)
   */
  async guardarMascota() {
    // Validar formulario
    if (!Utils.validarFormulario(elementos.form)) {
      Utils.mostrarAlerta('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    let submitButton;
    try {
      const mascotaId = elementos.inputMascotaId.value;
      submitButton = elementos.form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      if (appState.modoEdicion && mascotaId) {
        // Actualizar mascota existente
        const data = FormController.obtenerDatosFormulario();
        await API.actualizarMascota(mascotaId, data);
        Utils.mostrarAlerta('Mascota actualizada exitosamente', 'success');
      } else {
        // Crear nueva mascota
        const datos = FormController.obtenerDatosFormulario();
        const fotoFile = elementos.inputFoto.files[0];

        if (fotoFile) {
          // enviar multipart/form-data
          const formData = new FormData();
          Object.keys(datos).forEach(key => formData.append(key, datos[key]));
          formData.append('foto', fotoFile);
          console.log('Enviando FormData con imagen');
          await API.crearMascota(formData);
        } else {
          // enviar JSON (backend acepta JSON, como se usó en Postman)
          console.log('Enviando JSON sin imagen', datos);
          await API.crearMascota(datos);
        }

        Utils.mostrarAlerta('Mascota registrada exitosamente', 'success');
      }

      FormController.cancelar();
      this.cargarMascotas();
    } catch (error) {
      console.error('Error al guardar mascota:', error);
      Utils.mostrarAlerta('Error al guardar la mascota', 'danger');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  },

  /**
   * Prepara el formulario para editar una mascota
   * @param {number} id - ID de la mascota
   */
  async editarMascota(id) {
    try {
      const mascota = await API.obtenerMascota(id);
      FormController.rellenarFormulario(mascota);
      FormController.prepararEdicion();
    } catch (error) {
      console.error('Error al cargar mascota:', error);
      Utils.mostrarAlerta('Error al cargar los datos de la mascota', 'danger');
    }
    },

  /**
   * Muestra el modal de confirmación para eliminar
   * @param {number} id - ID de la mascota
   */
  confirmarEliminar(id) {
    appState.mascotaAEliminar = id;
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
  },

  /**
   * Elimina una mascota
   */
  async eliminarMascota() {
    if (!appState.mascotaAEliminar) return;

    try {
      await API.eliminarMascota(appState.mascotaAEliminar);
      Utils.mostrarAlerta('Mascota eliminada exitosamente', 'success');
      this.cargarMascotas();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      Utils.mostrarAlerta('Error al eliminar la mascota', 'danger');
    } finally {
      appState.mascotaAEliminar = null;
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
      modal.hide();
    }
  }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  MascotaController.init();
});