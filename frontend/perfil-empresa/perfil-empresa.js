// Variáveis globais
let isEditMode = false;
let originalData = {};

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function () {
    initializeTheme();
    loadCompanyData();
    initializeEventListeners();
    setupFormValidation();
});

// Inicializar tema
function initializeTheme() {
    // Verifica o modo salvo no localStorage ou usa o padrão (claro)
    const savedTheme = localStorage.getItem("theme");
    const themeIcon = document.getElementById("themeIcon");
    
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (themeIcon) {
            themeIcon.className = "fas fa-sun";
        }
    } else {
        document.body.classList.remove("dark");
        if (themeIcon) {
            themeIcon.className = "fas fa-moon";
        }
        // Se não há tema salvo, define como claro por padrão
        if (!savedTheme) {
            localStorage.setItem("theme", "light");
        }
    }
}

// Carregar dados da empresa
async function loadCompanyData() {
    id_empresa = sessionStorage.getItem("id_empresa")
    const response = await fetch(`/empresa_data?id=${id_empresa}`); // rota do backend

    const data = await response.json();
    const companyData = {
        razaoSocial: data.razao_social || "TechCorp Solutions Ltda",
        nomeFantasia: data.nome || "TechCorp Solutions",
        email: data.email || "contato@techcorp.com.br",
        cnpj: data.cnpj|| "12.345.678/0001-90",
        plano: localStorage.getItem("plano") || "professional"
    };
    
    // Atualizar campos do formulário
    document.getElementById("razaoSocial").value = companyData.razaoSocial;
    document.getElementById("nomeFantasia").value = companyData.nomeFantasia;
    document.getElementById("email").value = companyData.email;
    document.getElementById("cnpj").value = companyData.cnpj;
    document.getElementById("plano").value = companyData.plano;
    
    // Atualizar elementos de exibição
    document.getElementById("displayNomeFantasia").textContent = companyData.nomeFantasia;
    document.getElementById("displayPlano").textContent = getPlanoDisplayName(companyData.plano);
    document.getElementById("nome_empresa").textContent = companyData.nomeFantasia;
    document.getElementById("footer_empresa_name").textContent = companyData.nomeFantasia;
    
    // Salvar dados originais
    originalData = { ...companyData };
}

// Obter nome de exibição do plano
function getPlanoDisplayName(plano) {
    const planos = {
        'basico': 'Plano Básico',
        'professional': 'Plano Professional',
        'enterprise': 'Plano Enterprise'
    };
    return planos[plano] || 'Plano Professional';
}

// Inicializar event listeners
function initializeEventListeners() {
    // Form submission
    document.getElementById("profileForm").addEventListener("submit", handleFormSubmit);
    
    // CNPJ formatting
    document.getElementById("cnpj").addEventListener("input", formatCNPJ);
    
    // Email validation
    document.getElementById("email").addEventListener("blur", validateEmail);
}

// Configurar validação do formulário
function setupFormValidation() {
    const form = document.getElementById("profileForm");
    const inputs = form.querySelectorAll("input, select");
    
    inputs.forEach(input => {
        input.addEventListener("input", function() {
            validateField(this);
        });
    });
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";
    
    // Remove classes de erro anteriores
    field.classList.remove("error");
    
    switch (field.name) {
        case "razaoSocial":
            if (value.length < 3) {
                isValid = false;
                errorMessage = "Razão social deve ter pelo menos 3 caracteres";
            }
            break;
            
        case "nomeFantasia":
            if (value.length < 2) {
                isValid = false;
                errorMessage = "Nome fantasia deve ter pelo menos 2 caracteres";
            }
            break;
            
        case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = "E-mail inválido";
            }
            break;
            
        case "cnpj":
            if (!validateCNPJ(value)) {
                isValid = false;
                errorMessage = "CNPJ inválido";
            }
            break;
    }
    
    if (!isValid) {
        field.classList.add("error");
        showFieldError(field, errorMessage);
    } else {
        hideFieldError(field);
    }
    
    return isValid;
}

// Mostrar erro do campo
function showFieldError(field, message) {
    let errorElement = field.parentNode.querySelector(".field-error");
    if (!errorElement) {
        errorElement = document.createElement("span");
        errorElement.className = "field-error";
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

// Esconder erro do campo
function hideFieldError(field) {
    const errorElement = field.parentNode.querySelector(".field-error");
    if (errorElement) {
        errorElement.remove();
    }
}

// Alternar modo de edição
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById("editBtn");
    const formActions = document.getElementById("formActions");
    const inputs = document.querySelectorAll("#profileForm input, #profileForm select");
    
    if (isEditMode) {
        // Entrar no modo de edição
        editBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        editBtn.classList.add("editing");
        formActions.style.display = "flex";
        
        inputs.forEach(input => {
            if (input.name !== "cnpj") { // CNPJ não deve ser editável
                input.removeAttribute("readonly");
                input.removeAttribute("disabled");
            }
        });
        
        // Salvar dados originais
        originalData = getCurrentFormData();
        
    } else {
        // Sair do modo de edição
        cancelEdit();
    }
}

// Cancelar edição
function cancelEdit() {
    isEditMode = false;
    const editBtn = document.getElementById("editBtn");
    const formActions = document.getElementById("formActions");
    const inputs = document.querySelectorAll("#profileForm input, #profileForm select");
    
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editBtn.classList.remove("editing");
    formActions.style.display = "none";
    
    inputs.forEach(input => {
        input.setAttribute("readonly", "");
        if (input.tagName === "SELECT") {
            input.setAttribute("disabled", "");
        }
    });
    
    // Restaurar dados originais
    restoreOriginalData();
    
    // Limpar erros
    clearFormErrors();
}

// Obter dados atuais do formulário
function getCurrentFormData() {
    return {
        razaoSocial: document.getElementById("razaoSocial").value,
        nomeFantasia: document.getElementById("nomeFantasia").value,
        email: document.getElementById("email").value,
        cnpj: document.getElementById("cnpj").value,
        plano: document.getElementById("plano").value
    };
}

// Restaurar dados originais
function restoreOriginalData() {
    document.getElementById("razaoSocial").value = originalData.razaoSocial;
    document.getElementById("nomeFantasia").value = originalData.nomeFantasia;
    document.getElementById("email").value = originalData.email;
    document.getElementById("cnpj").value = originalData.cnpj;
    document.getElementById("plano").value = originalData.plano;
}

// Limpar erros do formulário
function clearFormErrors() {
    const errorElements = document.querySelectorAll(".field-error");
    errorElements.forEach(element => element.remove());
    
    const inputs = document.querySelectorAll("#profileForm input, #profileForm select");
    inputs.forEach(input => input.classList.remove("error"));
}

// Manipular submissão do formulário
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!isEditMode) return;
    
    // Validar todos os campos
    const form = document.getElementById("profileForm");
    const inputs = form.querySelectorAll("input[name], select[name]");
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification("Por favor, corrija os erros antes de salvar.", "error");
        return;
    }
    
    // Mostrar loading
    showLoading();
    
    // Simular salvamento (em produção, seria uma chamada para API)
    setTimeout(() => {
        saveCompanyData();
        hideLoading();
        showSuccessModal();
        toggleEditMode();
    }, 1500);
}

// Salvar dados da empresa
async function saveCompanyData() {
    const formData = getCurrentFormData();
    const id_empresa = sessionStorage.getItem("id_empresa")
    const response = await fetch(`/empresa/update/${id_empresa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
    
    
    // Atualizar elementos de exibição
    document.getElementById("displayNomeFantasia").textContent = formData.nomeFantasia;
    document.getElementById("displayPlano").textContent = getPlanoDisplayName(formData.plano);
    document.getElementById("nome_empresa").textContent = formData.nomeFantasia;
    document.getElementById("footer_empresa_name").textContent = formData.nomeFantasia;
    
    // Atualizar dados originais
    originalData = { ...formData };
}

// Formatar CNPJ
function formatCNPJ(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    event.target.value = value;
}

// Validar CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

// Validar email
function validateEmail(event) {
    const email = event.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(event.target, "E-mail inválido");
        event.target.classList.add("error");
    } else {
        hideFieldError(event.target);
        event.target.classList.remove("error");
    }
}

// Mostrar loading
function showLoading() {
    document.getElementById("loadingOverlay").classList.add("show");
}

// Esconder loading
function hideLoading() {
    document.getElementById("loadingOverlay").classList.remove("show");
}

// Mostrar modal de sucesso
function showSuccessModal() {
    document.getElementById("successModal").classList.add("show");
}

// Fechar modal
function closeModal() {
    document.getElementById("successModal").classList.remove("show");
}

// Mostrar notificação
function showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Gerenciar pagamento
function manageBilling() {
    showNotification("Redirecionando para a página de pagamento...", "info");
    setTimeout(() => {
        window.location.href = "../pagamento/pagamento.html";
    }, 1000);
}

// Funções do header

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById("themeIcon");
    
    // Alterna entre os temas
    if (body.classList.contains("dark")) {
        // Muda para tema claro
        body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        if (themeIcon) {
            themeIcon.className = "fas fa-moon";
        }
    } else {
        // Muda para tema escuro
        body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        if (themeIcon) {
            themeIcon.className = "fas fa-sun";
        }
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById("userMenuDropdown");
    dropdown.classList.toggle("show");
}

function openHelp() {
    showNotification("Abrindo central de ajuda...", "info");
    // Implementar abertura da ajuda
}

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        showLoading();
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "../login/login.html";
        }, 1000);
    }
}

// Funções da sidebar
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show");
}

function setActiveMenuItem(element) {
    // Remove active de todos os itens
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
    
    // Adiciona active ao item clicado
    element.classList.add("active");
}

// Fechar dropdowns ao clicar fora
document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("userMenuDropdown");
    const button = event.target.closest(".user-menu-btn");
    
    if (!button && dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});

// Adicionar estilos para notificações e erros
const additionalStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-primary);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    z-index: 10000;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
}

.notification.error {
    border-left: 4px solid var(--error-color);
}

.notification.success {
    border-left: 4px solid var(--success-color);
}

.notification.info {
    border-left: 4px solid var(--info-color);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
}

.notification-content i {
    color: var(--primary-color);
}

.notification.error .notification-content i {
    color: var(--error-color);
}

.notification.success .notification-content i {
    color: var(--success-color);
}

.notification-close {
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    padding: var(--spacing-xs);
}

.field-error {
    color: var(--error-color);
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.form-group input.error,
.form-group select.error {
    border-color: var(--error-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', additionalStyles);
