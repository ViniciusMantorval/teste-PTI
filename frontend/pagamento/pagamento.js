// Variáveis globais
let isDarkMode = false;
let selectedPlan = {
  id: 'professional',
  name: 'Plano Professional',
  price: 99.90,
  features: [
    'Até 200 funcionários',
    'Treinamentos ilimitados',
    'Relatórios avançados',
    'Suporte prioritário',
    'Gamificação'
  ]
};

// Dados dos planos
const plans = {
  basic: {
    id: 'basic',
    name: 'Plano Básico',
    price: 1499.90,
    description: 'Ideal para pequenas empresas',
    features: [
      'Até 50 funcionários',
      '10 treinamentos',
      'Relatórios básicos',
      'Suporte por email'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Plano Professional',
    price: 4499.90,
    description: 'Perfeito para empresas em crescimento',
    features: [
      'Até 200 funcionários',
      'Treinamentos ilimitados',
      'Relatórios avançados',
      'Suporte prioritário',
      'Gamificação'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Plano Enterprise',
    price: 9999.90,
    description: 'Para grandes corporações',
    features: [
      'Funcionários ilimitados',
      'Treinamentos ilimitados',
      'Analytics avançados',
      'Suporte 24/7',
      'API personalizada',
      'White label'
    ]
  },
  custom: {
    id: 'custom',
    name: 'Plano Personalizado',
    price: 299.90,
    description: 'Solução sob medida para sua empresa',
    features: [
      'Tudo do Enterprise',
      'Desenvolvimento customizado',
      'Integração dedicada',
      'Gerente de conta',
      'SLA garantido',
      'Treinamento presencial'
    ]
  }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  initializePaymentPage();
  setupEventListeners();
  loadUserData();
  checkThemePreference();
  setupFormValidation();
  setupPlanSelection();
});

// Inicializar página de pagamento
function initializePaymentPage() {
  // Aplicar máscara nos campos
  applyInputMasks();
  
  // Carregar dados do pedido
  updateOrderSummary();
}

// Configurar event listeners
function setupEventListeners() {
  // Fechar modais ao clicar fora
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
      closeModal();
    }
    
    // Fechar dropdowns ao clicar fora
    if (!event.target.closest('.notifications-dropdown') && !event.target.closest('.notification-btn')) {
      const notificationsDropdown = document.getElementById('notificationsDropdown');
      if (notificationsDropdown) {
        notificationsDropdown.classList.remove('show');
      }
    }
    
    if (!event.target.closest('.user-menu-dropdown') && !event.target.closest('.user-menu-btn')) {
      const userMenuDropdown = document.getElementById('userMenuDropdown');
      if (userMenuDropdown) {
        userMenuDropdown.classList.remove('show');
      }
    }
  });
  
  // Teclas de atalho
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

// Configurar seleção de planos
function setupPlanSelection() {
  const planInputs = document.querySelectorAll('input[name="selectedPlan"]');
  
  planInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        const planId = this.value;
        selectedPlan = plans[planId];
        updateOrderSummary();
      }
    });
  });
}

// Atualizar resumo do pedido
function updateOrderSummary() {
  const planNameElement = document.getElementById('selectedPlanName');
  const planDescriptionElement = document.getElementById('selectedPlanDescription');
  const planFeaturesElement = document.getElementById('selectedPlanFeatures');
  const subtotalElement = document.getElementById('subtotalPrice');
  const totalElement = document.getElementById('totalPrice');
  
  if (planNameElement) planNameElement.textContent = selectedPlan.name;
  if (planDescriptionElement) planDescriptionElement.textContent = selectedPlan.description;
  
  if (planFeaturesElement) {
    planFeaturesElement.innerHTML = selectedPlan.features
      .map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`)
      .join('');
  }
  
  const formattedPrice = formatCurrency(selectedPlan.price);
  if (subtotalElement) subtotalElement.textContent = formattedPrice;
  if (totalElement) totalElement.textContent = formattedPrice;
}

// Carregar dados do usuário
async function loadUserData() {
  const id_empresa = sessionStorage.getItem("id_empresa");
  try {
    const response = await fetch(`/empresa_data?id=${id_empresa}`);
    const data = await response.json();

    const welcomeText = document.getElementById('boasVindas'); 
    const companyName = document.getElementById('nome_empresa');
    const footer_empresa_name = document.getElementById('footer_empresa_name');

    if (welcomeText) welcomeText.innerText = `Bem-vindo, ${data.nome}`;
    if (companyName) companyName.innerText = data.nome;
    if (footer_empresa_name) footer_empresa_name.textContent = data.nome;
  } catch (error) {
    console.error("Falha ao carregar dados:", error);
  }
}

// Verificar preferência de tema
function checkThemePreference() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    enableDarkMode();
  }
}

// Alternar tema
function toggleTheme() {
  if (isDarkMode) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

// Ativar modo escuro
function enableDarkMode() {
  document.body.classList.add('dark');
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.className = 'fas fa-sun';
  }
  isDarkMode = true;
  localStorage.setItem('theme', 'dark');
}

// Desativar modo escuro
function disableDarkMode() {
  document.body.classList.remove('dark');
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.className = 'fas fa-moon';
  }
  isDarkMode = false;
  localStorage.setItem('theme', 'light');
}

// Aplicar máscaras nos campos de entrada
function applyInputMasks() {
  // Máscara para telefone
  const phoneInput = document.getElementById('customerPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        value = value.replace(/^(\d{2})(\d{1,5})$/, '($1) $2');
        value = value.replace(/^(\d{2})$/, '($1');
      }
      e.target.value = value;
    });
  }
  
  // Máscara para CPF
  const documentInput = document.getElementById('customerDocument');
  if (documentInput) {
    documentInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
        value = value.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
      }
      e.target.value = value;
    });
  }
}

// Configurar validação do formulário
function setupFormValidation() {
  const form = document.getElementById('paymentForm');
  const inputs = form.querySelectorAll('input[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

// Validar campo individual
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Validação básica de campo obrigatório
  if (!value) {
    isValid = false;
    errorMessage = 'Este campo é obrigatório';
  }
  
  // Validações específicas por tipo de campo
  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'E-mail inválido';
      }
      break;
      
    case 'tel':
      const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
      if (value && !phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Telefone inválido';
      }
      break;
      
    case 'date':
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18 || age > 120) {
          isValid = false;
          errorMessage = 'Data de nascimento inválida';
        }
      }
      break;
  }
  
  // Validação específica para CPF
  if (field.id === 'customerDocument') {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (value && !cpfRegex.test(value)) {
      isValid = false;
      errorMessage = 'CPF inválido';
    }
  }
  
  // Aplicar estilo de erro
  if (isValid) {
    field.classList.remove('error');
    removeErrorMessage(field);
  } else {
    field.classList.add('error');
    showErrorMessage(field, errorMessage);
  }
  
  return isValid;
}

// Mostrar mensagem de erro
function showErrorMessage(field, message) {
  removeErrorMessage(field);
  
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  field.parentNode.appendChild(errorElement);
}

// Remover mensagem de erro
function removeErrorMessage(field) {
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
}

// Processar pagamento
async function processPayment(event) {
  event.preventDefault();
  
  // Validar formulário
  const form = document.getElementById('paymentForm');
  const inputs = form.querySelectorAll('input[required]');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });
  
  if (!isFormValid) {
    showErrorModal('Por favor, corrija os erros no formulário antes de continuar.');
    return;
  }
  
  // Coletar dados do formulário
  const formData = new FormData(form);
  const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit_card';
  const id_empresa = sessionStorage.getItem("id_empresa")
  const paymentData = {
    // Dados do cliente
    payer: {
      name: formData.get('customerName'),
      email: formData.get('customerEmail'),
      phone: {
        area_code: formData.get('customerPhone').replace(/\D/g, '').substring(0, 2),
        number: formData.get('customerPhone').replace(/\D/g, '').substring(2)
      },
      identification: {
        type: 'CPF',
        number: formData.get('customerDocument').replace(/\D/g, '')
      },
    },
    // Dados do item
    items: [
      {
        id: selectedPlan.id,
        title: selectedPlan.name,
        description: selectedPlan.description,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: selectedPlan.price
      }
    ],
    // Configurações do pagamento
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12
    },
    // URLs de retorno
    back_urls: {
      success: 'https://traineasy.up.railway.app/pagamento/sucesso',
      failure: 'https://traineasy.up.railway.app/pagamento/falha',
      pending: 'https://traineasy.up.railway.app/pagamento/pendente'
    },
    // auto_return: 'approved',// funciona somente com server HTTPS
    external_reference: `order_${Date.now()}`,
    notification_url: 'https://your-backend.com/webhooks/mercadopago',
    id_empresa: id_empresa
  };
  
  // Mostrar loading
  showLoadingOverlay();
  
  try {
    // Chamar API do backend para criar preferência no Mercado Pago
    console.log(paymentData)
    const response = await fetch('/create-mercadopago-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    hideLoadingOverlay();
    
    if (response.ok && result.success) {
      // Sucesso - redirecionar para o Mercado Pago
      showSuccessModal();
      
      setTimeout(() => {
        if (result.init_point) {
          window.location.href = result.init_point;
        } else {
          // Fallback: usar SDK do Mercado Pago
          initMercadoPagoCheckout(result.preference_id);
        }
      }, 2000);
    } else {
      // Erro
      showErrorModal(result.message || 'Erro ao processar pagamento. Tente novamente.');
    }
    
  } catch (error) {
    hideLoadingOverlay();
    console.error('Erro ao processar pagamento:', error);
    
    // Fallback: criar preferência diretamente no frontend (apenas para demonstração)
    createMercadoPagoPreference(paymentData);
  }
}

// Criar preferência do Mercado Pago (fallback)
async function createMercadoPagoPreference(paymentData) {
  try {
    // Esta é uma implementação de exemplo
    // Em produção, você deve usar seu backend para criar a preferência
    const preference = {
      items: paymentData.items,
      payer: paymentData.payer,
      payment_methods: paymentData.payment_methods,
      back_urls: paymentData.back_urls,
      auto_return: paymentData.auto_return,
      external_reference: paymentData.external_reference
    };
    
    // Simular criação de preferência
    const mockResponse = {
      id: 'mock_preference_' + Date.now(),
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_preference_' + Date.now(),
      sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_preference_' + Date.now()
    };
    
    showSuccessModal();
    
    setTimeout(() => {
      // Em ambiente de desenvolvimento, usar sandbox
      const checkoutUrl = window.location.hostname === 'localhost' 
        ? mockResponse.sandbox_init_point 
        : mockResponse.init_point;
      
      window.location.href = checkoutUrl;
    }, 2000);
    
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    showErrorModal('Erro ao conectar com o Mercado Pago. Tente novamente.');
  }
}

// Inicializar checkout do Mercado Pago com SDK
function initMercadoPagoCheckout(preferenceId) {
  // Esta função seria usada se você incluísse o SDK do Mercado Pago
  // <script src="https://sdk.mercadopago.com/js/v2"></script>
  
  if (typeof MercadoPago !== 'undefined') {
    const mp = new MercadoPago('YOUR_PUBLIC_KEY', {
      locale: 'pt-BR'
    });
    
    mp.checkout({
      preference: {
        id: preferenceId
      },
      render: {
        container: '.cho-container',
        label: 'Pagar'
      }
    });
  } else {
    console.warn('SDK do Mercado Pago não carregado');
  }
}

// Mostrar overlay de carregamento
function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('show');
  }
}

// Esconder overlay de carregamento
function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

// Mostrar modal de sucesso
function showSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Mostrar modal de erro
function showErrorModal(message) {
  const modal = document.getElementById('errorModal');
  const messageElement = document.getElementById('errorMessage');
  
  if (messageElement) {
    messageElement.textContent = message;
  }
  
  if (modal) {
    modal.classList.add('show');
  }
}

// Fechar modal
function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.classList.remove('show');
  });
}

// Alternar sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('active');
  }
}

function setActiveMenuItem(element) {
  // Remove active de todos os itens
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Adiciona active ao item clicado
  element.classList.add('active');
}

function toggleNotifications() {
  const dropdown = document.getElementById('notificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function markAllAsRead() {
  const unreadItems = document.querySelectorAll('.notification-item.unread');
  unreadItems.forEach(item => {
    item.classList.remove('unread');
  });
  
  // Atualizar contador
  const notifCount = document.querySelector('.notif-count');
  if (notifCount) {
    notifCount.textContent = '0';
    notifCount.style.display = 'none';
  }
}

function viewAllNotifications() {
  console.log('Ver todas as notificações');
  // Implementar navegação para página de notificações
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function openProfile() {
  console.log('Abrir perfil do usuário');
  // Implementar navegação para perfil
}

function openHelp() {
  console.log('Abrir ajuda');
  // Implementar sistema de ajuda
}

function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    showNotification('Fazendo logout...', 'info');
    // Aqui você pode adicionar a lógica de logout
    setTimeout(() => {
      window.location.href = '../login/login.html';
    }, 1000);
  }
}

// Utilitários para formatação
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

function formatCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
}






