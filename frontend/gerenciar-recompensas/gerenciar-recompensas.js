// Variáveis globais
let isDarkMode = false;
let notifications = [
  {
    id: 1,
    icon: 'fas fa-plus-circle',
    title: 'Nova recompensa criada',
    message: 'Recompensa "Vale Presente" foi criada com sucesso',
    time: '5 min atrás',
    unread: true
  },
  {
    id: 2,
    icon: 'fas fa-edit',
    title: 'Recompensa editada',
    message: 'Recompensa "Desconto em Produtos" foi atualizada',
    time: '1 hora atrás',
    unread: true
  },
  {
    id: 3,
    icon: 'fas fa-gift',
    title: 'Recompensa resgatada',
    message: 'João Silva resgatou a recompensa "Férias Extras"',
    time: '2 horas atrás',
    unread: false
  }
];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  setupEventListeners();
  loadUserData();
  checkThemePreference();
  carregarRecompensas(); // Função original para carregar recompensas
});

// Inicializar dashboard
function initializeDashboard() {
  updateNotificationCount();
  renderNotifications();
}

// Configurar event listeners
function setupEventListeners() {
  // Fechar dropdowns ao clicar fora
  document.addEventListener('click', function(event) {
    closeAllDropdowns(event);
  });
  
  // Teclas de atalho
  document.addEventListener('keydown', function(event) {
    handleKeyboardShortcuts(event);
  });
  
  // Redimensionamento da janela
  window.addEventListener('resize', function() {
    handleWindowResize();
  });
}

// Carregar dados do usuário
async function loadUserData() {
  const id_empresa = sessionStorage.getItem("id_empresa")
  try {
    const response = await fetch(`/empresa_data?id=${id_empresa}`); // rota do backend

    const data = await response.json();
    console.log(data.nome)

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

// Alternar notificações
function toggleNotifications() {
  const dropdown = document.getElementById('notificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Marcar todas as notificações como lidas
function markAllAsRead() {
  notifications.forEach(notification => {
    notification.unread = false;
  });
  updateNotificationCount();
  renderNotifications();
  
}

// Atualizar contador de notificações
function updateNotificationCount() {
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

// Renderizar notificações
function renderNotifications() {
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


// Alternar busca
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

// Fechar busca
function closeSearch() {
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');
  
  if (searchContainer) {
    searchContainer.classList.remove('show');
    if (searchInput) searchInput.value = '';
  }
}

// Manipular busca
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  
  if (event.key === 'Enter' && query.trim()) {
    performSearch(query);
  }
}

// Executar busca
function performSearch(query) {
  showNotification(`Buscando por: "${query}"`, 'info');
 
}

// Alternar menu do usuário
function toggleUserMenu() {
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Alternar sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

// Fechar sidebar
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('show');
  }
}

// Definir item ativo do menu
function setActiveMenuItem(element) {
  // Remover classe active de todos os itens
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Adicionar classe active ao item clicado
  element.classList.add('active');
}


// Logout
function logout() {
  showLoadingOverlay();
  
  setTimeout(() => {
    hideLoadingOverlay();
    showNotification('Logout realizado com sucesso!', 'success');
  }, 2000);
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

// Mostrar notificação
function showNotification(message, type = 'info') {
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Adicionar estilos
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-primary);
    color: var(--gray-900);
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Fechar todos os dropdowns
function closeAllDropdowns(event) {
  const dropdowns = document.querySelectorAll('.notifications-dropdown, .user-menu-dropdown, .search-container');
  
  dropdowns.forEach(dropdown => {
    if (!dropdown.contains(event.target) && !event.target.closest('.notification-btn, .user-menu-btn, .search-btn')) {
      dropdown.classList.remove('show');
    }
  });
}

// Manipular atalhos de teclado
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + K para busca
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    toggleSearch();
  }
  
  // Escape para fechar dropdowns
  if (event.key === 'Escape') {
    closeAllDropdowns({ target: document.body });
    closeSearch();
  }
}

// Manipular redimensionamento da janela
function handleWindowResize() {
  // Fechar sidebar no desktop
  if (window.innerWidth > 1024) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('show');
    }
  }
}

// ===== CÓDIGO ORIGINAL FUNCIONAL PARA GERENCIAR RECOMPENSAS =====
async function carregarRecompensas() {
  const lista = document.getElementById("lista-recompensas");
  const id_empresa = sessionStorage.getItem("id_empresa");

  if (!id_empresa) {
    showNotification('ID da empresa não encontrado', 'error');
    return;
  }

  try {
    showLoadingOverlay();
    lista.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
        <p style="color: var(--gray-600);">Carregando recompensas...</p>
      </div>
    `;

    const res = await fetch(`/recompensas?id_empresa=${id_empresa}`);
    const recompensas = await res.json();

    lista.innerHTML = "";

    if (recompensas.length === 0) {
      lista.innerHTML = `
        <div class="no-trainings">
          <i class="fas fa-gift" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
          <h3 style="color: var(--gray-600); margin-bottom: 0.5rem;">Nenhuma recompensa cadastrada</h3>
          <p style="color: var(--gray-500);">Crie sua primeira recompensa para começar.</p>
        </div>
      `;
    } else {
      recompensas.forEach(r => {
        console.log(r);
        console.log(r.quantidade_disponivel);
        
        const div = document.createElement("div");   
        div.className = "recompensa";

        const nomeInput = criarInput("text", r.nome);
        const descInput = criarTextarea(r.descricao);
        const pontosInput = criarInput("number", r.preco_pontos);
        const qtdInput = criarInput("number", r.quantidade_disponivel);

        nomeInput.disabled = true;
        descInput.disabled = true;
        pontosInput.disabled = true;
        qtdInput.disabled = true;

        const btnEditar = criarBotao("✏️ Editar", "edit");
        const btnSalvar = criarBotao("💾 Salvar", "save");
        const btnCancelar = criarBotao("✖️ Cancelar", "cancel");
        const btnExcluir = criarBotao("🗑️ Excluir", "delete");

        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";

        btnEditar.onclick = () => {
          nomeInput.disabled = false;
          descInput.disabled = false;
          pontosInput.disabled = false;
          qtdInput.disabled = false;
          btnEditar.style.display = "none";
          btnSalvar.style.display = "inline-block";
          btnCancelar.style.display = "inline-block";
          showNotification('Modo de edição ativado', 'info');
        };

        btnCancelar.onclick = () => {
          nomeInput.value = r.nome;
          descInput.value = r.descricao;
          pontosInput.value = r.preco_pontos;
          qtdInput.value = r.quantidade_disponivel;
          
          nomeInput.disabled = true;
          descInput.disabled = true;
          pontosInput.disabled = true;
          qtdInput.disabled = true;
          btnEditar.style.display = "inline-block";
          btnSalvar.style.display = "none";
          btnCancelar.style.display = "none";
          showNotification('Edição cancelada', 'info');
        };

        btnSalvar.onclick = async () => {
          const atualizados = {
            nome: nomeInput.value.trim(),
            descricao: descInput.value.trim(),
            preco_pontos: parseInt(pontosInput.value.trim()),
            id_empresa: id_empresa,
            quantidade_disponivel: parseInt(qtdInput.value.trim())
          };

          if (!atualizados.nome || !atualizados.descricao || !atualizados.preco_pontos || !atualizados.quantidade_disponivel) {
            showNotification('Preencha todos os campos', 'error');
            return;
          }

          try {
            showLoadingOverlay();
            const res = await fetch(`/recompensas/${r.id_recompensa}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(atualizados)
            });

            if (res.ok) {
              showNotification("Recompensa atualizada com sucesso!", 'success');
              carregarRecompensas();
            } else {
              showNotification("Erro ao atualizar recompensa.", 'error');
            }
          } catch (error) {
            console.error('Erro ao atualizar recompensa:', error);
            showNotification("Erro ao atualizar recompensa.", 'error');
          } finally {
            hideLoadingOverlay();
          }
        };

        btnExcluir.onclick = async () => {
          if (!confirm(`Tem certeza que deseja excluir "${r.nome}"? Esta ação não pode ser desfeita.`)) {
            return;
          }

          try {
            showLoadingOverlay();
            const res = await fetch(`/recompensas/${r.id_recompensa}`, {
              method: "DELETE"
            });

            if (res.ok) {
              showNotification("Recompensa excluída com sucesso!", 'success');
              carregarRecompensas();
            } else {
              showNotification("Erro ao excluir recompensa.", 'error');
            }
          } catch (error) {
            console.error('Erro ao excluir recompensa:', error);
            showNotification("Erro ao excluir recompensa.", 'error');
          } finally {
            hideLoadingOverlay();
          }
        };

        div.appendChild(nomeInput);
        div.appendChild(descInput);
        div.appendChild(pontosInput);
        div.appendChild(qtdInput);

        const btnGroup = document.createElement("div");
        btnGroup.className = "buttons";
        btnGroup.appendChild(btnEditar);
        btnGroup.appendChild(btnSalvar);
        btnGroup.appendChild(btnCancelar);
        btnGroup.appendChild(btnExcluir);

        div.appendChild(btnGroup);
        lista.appendChild(div);
      });
    }

    // Botão Nova Recompensa
    const btnNovaRecompensa = document.createElement("button");
    btnNovaRecompensa.textContent = "➕ Nova Recompensa";
    btnNovaRecompensa.className = "nova-recompensa";
    btnNovaRecompensa.onclick = () => {
      showNotification('Redirecionando para criação de recompensa...', 'info');
      window.location.href = "../criar-recompensa/criar-recompensa.html";
    };
    lista.appendChild(btnNovaRecompensa);

    // Notificação removida conforme solicitado
  } catch (err) {
    console.error('Erro ao carregar recompensas:', err);
    showNotification('Erro ao carregar recompensas', 'error');
    lista.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error-color); margin-bottom: 1rem;"></i>
        <h3 style="color: var(--error-color); margin-bottom: 0.5rem;">Erro ao carregar recompensas</h3>
        <p style="color: var(--gray-500);">Verifique sua conexão e tente novamente.</p>
        <button onclick="carregarRecompensas()" style="margin-top: 1rem;">Tentar novamente</button>
      </div>
    `;
  } finally {
    hideLoadingOverlay();
  }
}

function criarInput(type, value) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  return input;
}

function criarTextarea(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  return textarea;
}

function criarBotao(texto, classe) {
  const btn = document.createElement("button");
  btn.textContent = texto;
  btn.className = classe;
  return btn;
}

// Função para adicionar nova recompensa (compatibilidade com HTML)
function adicionarNovaRecompensa() {
  showNotification('Redirecionando para criação de recompensa...', 'info');
  window.location.href = "../criar-recompensa/criar-recompensa.html";
}

// ==================================================
// CÓDIGO JAVASCRIPT CORRIGIDO E FINAL
// ==================================================

async function carregarRecompensas() {
    const listaContainer = document.getElementById("lista-recompensas");
    const id_empresa = sessionStorage.getItem("id_empresa");

    if (!id_empresa) {
        showNotification('ID da empresa não encontrado.', 'error');
        return;
    }

    try {
        showLoadingOverlay();
        listaContainer.innerHTML = ''; // Limpa completamente o container

        const res = await fetch(`/recompensas?id_empresa=${id_empresa}` );
        const recompensas = await res.json();

        // 1. Renderiza os cards de recompensas existentes
        recompensas.forEach(r => {
            const card = document.createElement("div");
            card.className = "recompensa-card";

            // Cria os campos com labels
            card.innerHTML = `
                <div class="form-group">
                    <label>Nome da Recompensa</label>
                    <input type="text" value="${r.nome}" disabled>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea disabled>${r.descricao}</textarea>
                </div>
                <div class="form-group">
                    <label>Custo em Pontos</label>
                    <input type="number" value="${r.preco_pontos}" disabled>
                </div>
                <div class="form-group">
                    <label>Quantidade Disponível</label>
                    <input type="number" value="${r.quantidade_disponivel}" disabled>
                </div>
                <div class="card-buttons">
                    <button class="edit-btn"><i class="fas fa-pencil-alt"></i> Editar</button>
                    <button class="save-btn" style="display: none;"><i class="fas fa-save"></i> Salvar</button>
                    <button class="cancel-btn" style="display: none;"><i class="fas fa-times"></i> Cancelar</button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            `;
            listaContainer.appendChild(card);

            // Adiciona a lógica dos botões para este card específico
            setupCardButtons(card, r, id_empresa);
        });

        // 2. Adiciona o card "Adicionar Nova Recompensa" ao final
        const addCard = document.createElement("div");
        addCard.className = "add-recompensa-card";
        addCard.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Nova Recompensa</span>
        `;
        addCard.onclick = () => {
            window.location.href = "../criar-recompensa/criar-recompensa.html";
        };
        listaContainer.appendChild(addCard);

    } catch (err) {
        console.error('Erro ao carregar recompensas:', err);
        listaContainer.innerHTML = `<p>Erro ao carregar recompensas. Tente novamente.</p>`;
        showNotification('Erro ao carregar recompensas', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// ==================================================
//          FUNÇÃO JAVASCRIPT CORRIGIDA
// ==================================================
function setupCardButtons(card, recompensaData, id_empresa) {
    const inputs = card.querySelectorAll('input, textarea');
    const btnEdit = card.querySelector('.edit-btn');
    const btnSave = card.querySelector('.save-btn');
    const btnCancel = card.querySelector('.cancel-btn');
    const btnDelete = card.querySelector('.delete-btn');

    // Define o estado inicial como 'readonly'
    inputs.forEach(input => input.readOnly = true);

    btnEdit.onclick = () => {
        // Habilita a edição mudando 'readonly' para 'false'
        inputs.forEach(input => input.readOnly = false);
        card.classList.add('editing'); // Adiciona uma classe para feedback visual

        btnEdit.style.display = 'none';
        btnDelete.style.display = 'none';
        btnSave.style.display = 'inline-flex';
        btnCancel.style.display = 'inline-flex';
    };

    btnCancel.onclick = () => {
        // Restaura os valores originais
        card.querySelector('input[type="text"]').value = recompensaData.nome;
        card.querySelector('textarea').value = recompensaData.descricao;
        card.querySelectorAll('input[type="number"]')[0].value = recompensaData.preco_pontos;
        card.querySelectorAll('input[type="number"]')[1].value = recompensaData.quantidade_disponivel;
        
        // Bloqueia a edição mudando 'readonly' para 'true'
        inputs.forEach(input => input.readOnly = true);
        card.classList.remove('editing'); // Remove a classe de edição

        btnEdit.style.display = 'inline-flex';
        btnDelete.style.display = 'inline-flex';
        btnSave.style.display = 'none';
        btnCancel.style.display = 'none';
    };

    // As funções de salvar e deletar continuam iguais...
    btnDelete.onclick = async () => {
        if (!confirm(`Tem certeza que deseja excluir a recompensa "${recompensaData.nome}"?`)) return;
        await fetch(`/recompensas/${recompensaData.id_recompensa}`, { method: "DELETE" } );
        carregarRecompensas();
    };

    btnSave.onclick = async () => {
        const atualizados = {
            nome: card.querySelector('input[type="text"]').value.trim(),
            descricao: card.querySelector('textarea').value.trim(),
            preco_pontos: parseInt(card.querySelectorAll('input[type="number"]')[0].value),
            quantidade_disponivel: parseInt(card.querySelectorAll('input[type="number"]')[1].value),
            id_empresa: id_empresa
        };
        await fetch(`/recompensas/${recompensaData.id_recompensa}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(atualizados )
        });
        carregarRecompensas();
    };
}


