// Variáveis globais
let currentSection = 'criar-recompensa';
let isDarkMode = false;
let notifications = [
  {
    id: 1,
    icon: 'fas fa-user-plus',
    title: 'Novo funcionário cadastrado',
    message: 'Maria Silva foi adicionada ao departamento de TI',
    time: '2 min atrás',
    unread: true
  },
  {
    id: 2,
    icon: 'fas fa-graduation-cap',
    title: 'Treinamento concluído',
    message: '15 funcionários concluíram o curso de JavaScript',
    time: '1 hora atrás',
    unread: true
  }
];

// Configuração da API
const API_CONFIG = {
  baseURL: '',
  endpoints: {
    criarRecompensa: '/criar-recompensas'
  },
  timeout: 10000
};

// Estado da aplicação
class AppState {
  constructor() {
    this.isSubmitting = false;
    this.validationErrors = {};
    this.connectionStatus = 'unknown';
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  setSubmitting(status) {
    this.isSubmitting = status;
    this.updateUI();
  }

  setValidationError(field, error) {
    if (error) {
      this.validationErrors[field] = error;
    } else {
      delete this.validationErrors[field];
    }
    this.updateFieldError(field, error);
  }

  updateFieldError(field, error) {
    const fieldElement = document.getElementById(field);
    const formGroup = fieldElement?.closest('.form-group');
    
    if (!formGroup) return;

    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
      existingError.textContent = error || '';
    }

    if (error) {
      formGroup.classList.add('has-error');
    } else {
      formGroup.classList.remove('has-error');
    }
  }

  updateUI() {
    const submitBtn = document.getElementById('submit-btn');
    const hasErrors = Object.keys(this.validationErrors).length > 0;
    
    if (submitBtn) {
      submitBtn.disabled = this.isSubmitting || hasErrors;
      
      if (this.isSubmitting) {
        submitBtn.classList.add('loading');
      } else {
        submitBtn.classList.remove('loading');
      }
    }
  }

  isFormValid() {
    return Object.keys(this.validationErrors).length === 0;
  }
}

// Utilitários
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  validateField(field, value) {
    const validators = {
      nome: (val) => {
        if (!val || val.trim().length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (val.length > 100) {
          return 'Nome deve ter no máximo 100 caracteres';
        }
        return null;
      },
      descricao: (val) => {
        if (!val || val.trim().length < 10) {
          return 'Descrição deve ter pelo menos 10 caracteres';
        }
        if (val.length > 500) {
          return 'Descrição deve ter no máximo 500 caracteres';
        }
        return null;
      },
      pontos: (val) => {
        const num = parseInt(val);
        if (!val || isNaN(num) || num < 1) {
          return 'Pontos deve ser um número maior que 0';
        }
        if (num > 10000) {
          return 'Pontos deve ser no máximo 10.000';
        }
        return null;
      },
      quantidade: (val) => {
        const num = parseInt(val);
        if (!val || isNaN(num) || num < 1) {
          return 'Quantidade deve ser um número maior que 0';
        }
        if (num > 1000) {
          return 'Quantidade deve ser no máximo 1.000';
        }
        return null;
      }
    };

    return validators[field] ? validators[field](value) : null;
  },

  sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
  }
};

// Gerenciador de API
class APIManager {
  constructor() {
    this.controller = null;
  }

  async makeRequest(endpoint, options = {}) {
    if (this.controller) {
      this.controller.abort();
    }
  
    this.controller = new AbortController();
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: this.controller.signal,
      timeout: API_CONFIG.timeout
    };
  
    const finalOptions = { ...defaultOptions, ...options };
    const url = `${API_CONFIG.baseURL}${endpoint}`;
  
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), finalOptions.timeout);
      });
  
      const fetchPromise = fetch(url, finalOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
  
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new Error(errorData.error || errorData || `Erro HTTP: ${response.status}`);
      }
  
      // 🔑 Aqui está a correção: trata JSON ou texto
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
  
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Requisição cancelada');
      }
      throw error;
    }
  }
  

  async criarRecompensa(dados) {
    return this.makeRequest(API_CONFIG.endpoints.criarRecompensa, {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }
}

// Classe principal da aplicação
class RecompensaApp {
  constructor() {
    this.state = new AppState();
    this.api = new APIManager();
    this.form = null;
    this.fields = {};
    
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.setupValidation();
    this.loadUserData();
    this.checkThemePreference();
    this.updateNotificationCount();
    this.renderNotifications();
  }

  setupElements() {
    this.form = document.getElementById('form-recompensa');
    this.fields = {
      nome: document.getElementById('nome'),
      descricao: document.getElementById('descricao'),
      pontos: document.getElementById('pontos'),
      quantidade: document.getElementById('quantidade')
    };
  }

  setupEventListeners() {
    // Event listeners do dashboard
    document.addEventListener('click', (event) => {
      this.closeAllDropdowns(event);
    });

    // Event listeners do formulário
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    // Listeners para validação em tempo real e preview
    Object.entries(this.fields).forEach(([fieldName, fieldElement]) => {
      if (fieldElement) {
        const debouncedValidate = Utils.debounce(() => {
          this.validateField(fieldName);
          this.updatePreview();
        }, 300);

        fieldElement.addEventListener('input', debouncedValidate);
        fieldElement.addEventListener('blur', () => this.validateField(fieldName));
      }
    });

    // Listeners para conexão
    window.addEventListener('online', () => {
      this.showNotification('Conexão restaurada!', 'success', 2000);
    });

    window.addEventListener('offline', () => {
      this.showNotification('Sem conexão com a internet', 'error', 0);
    });
  }

  setupValidation() {
    Object.keys(this.fields).forEach(fieldName => {
      this.validateField(fieldName);
    });
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return;

    const value = Utils.sanitizeInput(field.value);
    const error = Utils.validateField(fieldName, value);
    
    this.state.setValidationError(fieldName, error);
  }

  updatePreview() {
    const previewCard = document.getElementById('previewCard');
    const nome = this.fields.nome.value.trim();
    const descricao = this.fields.descricao.value.trim();
    const pontos = this.fields.pontos.value;
    const quantidade = this.fields.quantidade.value;

    if (nome || descricao || pontos || quantidade) {
      previewCard.style.display = 'block';
      
      document.getElementById('previewNome').textContent = nome || 'Nome da Recompensa';
      document.getElementById('previewDescricao').textContent = descricao || 'Descrição da recompensa...';
      document.getElementById('previewPontos').innerHTML = `<i class="fas fa-coins"></i> ${pontos || 0} pontos`;
      document.getElementById('previewQuantidade').innerHTML = `<i class="fas fa-box"></i> ${quantidade || 0} em estoque`;
    } else {
      previewCard.style.display = 'none';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.state.isSubmitting) return;

    this.validateAllFields();
    
    if (!this.state.isFormValid()) {
      this.showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    this.state.setSubmitting(true);
    this.showLoadingOverlay();

    try {
      const formData = this.getFormData();
      await this.submitForm(formData);
      console.log("Criado")
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.state.setSubmitting(false);
      this.hideLoadingOverlay();
    }
  }

  validateAllFields() {
    Object.keys(this.fields).forEach(fieldName => {
      this.validateField(fieldName);
    });
  }

  getFormData() {
    const idEmpresa = sessionStorage.getItem("id_empresa");
    
    if (!idEmpresa) {
      throw new Error('ID da empresa não encontrado. Faça login novamente.');
    }

    return {
      nome: Utils.sanitizeInput(this.fields.nome.value),
      descricao: Utils.sanitizeInput(this.fields.descricao.value),
      preco_pontos: parseInt(this.fields.pontos.value),
      quantidade: parseInt(this.fields.quantidade.value),
      id_empresa: idEmpresa
    };
  }

  async submitForm(formData) {
    try {
      await this.api.criarRecompensa(formData);
      this.showSuccessModal();
    } catch (error) {
      if (this.state.retryCount < this.state.maxRetries && this.isNetworkError(error)) {
        this.state.retryCount++;
        // this.showNotification(`Tentativa ${this.state.retryCount}/${this.state.maxRetries}...`, 'warning');
        
        await new Promise(resolve => setTimeout(resolve, 1000 * this.state.retryCount));
        return this.submitForm(formData);
      }
      
      throw error;
    }
  }

  isNetworkError(error) {
    return error.message.includes('Timeout') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('Network');
  }

  handleSubmitError(error) {
    console.error('Erro ao enviar formulário:', error);
    
    let errorMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.message.includes('Timeout')) {
      errorMessage = 'Tempo limite excedido. Verifique sua conexão.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.message.includes('ID da empresa')) {
      errorMessage = error.message;
    } else if (error.message.length > 0 && error.message.length < 100) {
      errorMessage = error.message;
    }
    
    // this.showNotification(errorMessage, 'error');
    this.state.retryCount = 0;
  }

  showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
  }

  resetForm() {
    this.form.reset();
    
    Object.keys(this.fields).forEach(fieldName => {
      this.state.setValidationError(fieldName, null);
    });
    
    document.getElementById('previewCard').style.display = 'none';
    
    if (this.fields.nome) {
      this.fields.nome.focus();
    }
  }

  // Funcionalidades do dashboard
  async loadUserData() {
    const id_empresa = sessionStorage.getItem("id_empresa") || 1;
    try {
      const response = await fetch(`/empresa_data?id=${id_empresa}`);
      const data = await response.json();
      
      const welcomeText = document.getElementById('boasVindas');
      const companyName = document.getElementById('nome_empresa');
      const footer_empresa_name = document.getElementById('footer_empresa_name');
      
      if (welcomeText) welcomeText.innerText = `Bem-vindo ${data.nome}`;
      if (companyName) companyName.innerText = data.nome;
      if (footer_empresa_name) footer_empresa_name.textContent = `${data.nome}`;
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
    }
  }

  checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.enableDarkMode();
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.className = 'fas fa-sun';
    }
    isDarkMode = true;
    localStorage.setItem('theme', 'dark');
  }

  disableDarkMode() {
    document.body.classList.remove('dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.className = 'fas fa-moon';
    }
    isDarkMode = false;
    localStorage.setItem('theme', 'light');
  }

  updateNotificationCount() {
    const unreadCount = notifications.filter(n => n.unread).length;
    const countElement = document.querySelector('.notif-count');
    
    if (countElement) {
      if (unreadCount > 0) {
        countElement.textContent = unreadCount;
        countElement.style.display = 'block';
      } else {
        countElement.style.display = 'none';
      }
    }
  }

  renderNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = notifications.map(notification => `
      <div class="notification-item ${notification.unread ? 'unread' : ''}">
        <div class="notification-icon">
          <i class="${notification.icon}"></i>
        </div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <span class="notification-time">${notification.time}</span>
        </div>
      </div>
    `).join('');
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, duration);
    }
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'exclamation-circle';
      case 'warning': return 'exclamation-triangle';
      default: return 'info-circle';
    }
  }

  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('show');
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  closeAllDropdowns(event) {
    const dropdowns = [
      'notificationsDropdown',
      'userMenuDropdown'
    ];
    
    dropdowns.forEach(dropdownId => {
      const dropdown = document.getElementById(dropdownId);
      const trigger = event.target.closest(`[onclick*="${dropdownId.replace('Dropdown', '')}"]`);
      
      if (dropdown && !trigger && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
    
    const searchContainer = document.getElementById('searchContainer');
    const searchBtn = document.querySelector('.search-btn');
    if (searchContainer && !searchBtn.contains(event.target) && !searchContainer.contains(event.target)) {
      searchContainer.classList.remove('show');
    }
  }
}

// Funções globais para o dashboard
function toggleTheme() {
  if (isDarkMode) {
    app.disableDarkMode();
  } else {
    app.enableDarkMode();
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function markAllAsRead() {
  notifications.forEach(notification => {
    notification.unread = false;
  });
  app.updateNotificationCount();
  app.renderNotifications();
  app.showNotification('Todas as notificações foram marcadas como lidas', 'success');
}

function viewAllNotifications() {
  app.showNotification('Navegando para todas as notificações...', 'info');
}

function toggleSearch() {
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');
  
  if (searchContainer) {
    searchContainer.classList.toggle('show');
    if (searchContainer.classList.contains('show')) {
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 300);
    }
  }
}

function closeSearch() {
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');
  
  if (searchContainer) {
    searchContainer.classList.remove('show');
    if (searchInput) searchInput.value = '';
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  
  if (event.key === 'Enter' && query.trim()) {
    app.showNotification(`Buscando por: "${query}"`, 'info');
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('show');
  }
}

function setActiveMenuItem(element) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
}

function openHelp() {
  app.showNotification('Abrindo central de ajuda...', 'info');
}

function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    app.showLoadingOverlay();
    setTimeout(() => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '../login/login.html';
    }, 1000);
  }
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('show');
  app.resetForm();
}

function redirectToManagement() {
  window.location.href = '../gerenciar-recompensas/gerenciar-recompensas.html';
}

// Inicializar aplicação
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new RecompensaApp();
});

// Adicionar estilos para notificações toast
const style = document.createElement('style');
style.textContent = `
  .notification-toast {
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
    padding: var(--spacing-lg);
    z-index: 10001;
    transform: translateX(400px);
    opacity: 0;
    transition: all var(--transition-normal);
    min-width: 300px;
  }
  
  .notification-toast.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .notification-toast .notification-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .notification-toast.notification-success {
    border-left: 4px solid var(--success-color);
  }
  
  .notification-toast.notification-error {
    border-left: 4px solid var(--error-color);
  }
  
  .notification-toast.notification-warning {
    border-left: 4px solid var(--warning-color);
  }
  
  .notification-toast.notification-info {
    border-left: 4px solid var(--info-color);
  }
  
  .notification-toast i {
    font-size: 1.25rem;
  }
  
  .notification-success i { color: var(--success-color); }
  .notification-error i { color: var(--error-color); }
  .notification-warning i { color: var(--warning-color); }
  .notification-info i { color: var(--info-color); }
`;

document.head.appendChild(style);


