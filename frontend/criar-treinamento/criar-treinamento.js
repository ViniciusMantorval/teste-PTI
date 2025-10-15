document.addEventListener("DOMContentLoaded", () => {
  
    // Variável global para guardar a URL do vídeo (usada no modo automático)
    let video_url = null;
    let id_empresa = sessionStorage.getItem("id_empresa") || 1;
    loadUserData();
    


    // --- ELEMENTOS DO DOM ---
    const informacoesBasicasCard = document.getElementById("informacoes-basicas-card");
    const modoCriacaoSelect = document.getElementById("modo-criacao");
    const conteudoTreinamento = document.getElementById("conteudo-treinamento");
    const formManual = document.getElementById("form-manual");
    const formVideo = document.getElementById("formVideo");
    const conteudoDiv = document.getElementById("conteudo");
  
    // Botões do formulário manual
    const btnAdicionarTopico = document.getElementById("btnAdicionarTopico");
    const btnAdicionarPergunta = document.getElementById("btnAdicionarPergunta");
    const btnSalvarManual = document.getElementById("btnSalvarManual");
    
    // Contêineres para os itens dinâmicos
    const topicosContainer = document.getElementById("topicos-container");
    const quizContainer = document.getElementById("quiz-container");
    
    // Contadores para garantir IDs únicos
    let topicoCounter = 0;
    let perguntaCounter = 0;
    
    // --- FUNCIONALIDADES DO DASHBOARD ---
    
    window.toggleNotifications = function() {
      const dropdown = document.getElementById("notificationsDropdown");
      dropdown.classList.toggle("show");
    };
  
    window.markAllAsRead = function() {
      const unreadItems = document.querySelectorAll(".notification-item.unread");
      unreadItems.forEach(item => {
        item.classList.remove("unread");
      });
      
      const notifCount = document.querySelector(".notif-count");
      notifCount.textContent = "0";
      notifCount.style.display = "none";
    };
  
    window.viewAllNotifications = function() {
      console.log("Navegando para todas as notificações...");
    };
  
    window.toggleSearch = function() {
      const searchContainer = document.getElementById("searchContainer");
      const searchInput = document.getElementById("searchInput");
      searchContainer.classList.toggle("show");
      if (searchContainer.classList.contains("show")) {
        searchInput.focus();
      }
    };
  
    window.closeSearch = function() {
      const searchContainer = document.getElementById("searchContainer");
      const searchInput = document.getElementById("searchInput");
      searchContainer.classList.remove("show");
      searchInput.value = "";
    };
  
    window.handleSearch = function(event) {
      if (event.key === "Enter") {
        const query = event.target.value;
        console.log("Buscando por:", query);
      }
    };
  
    window.toggleTheme = function() {
      document.body.classList.toggle("dark");
      const themeIcon = document.getElementById("themeIcon");
      
      if (document.body.classList.contains("dark")) {
        themeIcon.className = "fas fa-sun";
        localStorage.setItem("theme", "dark");
      } else {
        themeIcon.className = "fas fa-moon";
        localStorage.setItem("theme", "light");
      }
    };
  
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      document.getElementById("themeIcon").className = "fas fa-sun";
    }
  
    window.toggleUserMenu = function() {
      const dropdown = document.getElementById("userMenuDropdown");
      dropdown.classList.toggle("show");
    };
  
    window.openSettings = function() {
      console.log("Abrindo configurações...");
    };
  
    window.openHelp = function() {
      console.log("Abrindo ajuda...");
    };
  
    window.logout = function() {
      if (confirm("Tem certeza que deseja sair?")) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "../login/login.html";
      }
    };
  
    window.toggleSidebar = function() {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("show");
    };
  
    window.closeSidebar = function() {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.remove("show");
    };
  
    window.setActiveMenuItem = function(element) {
      document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
      });
      
      element.classList.add("active");
    };
  
    document.addEventListener("click", (e) => {
      const notificationsDropdown = document.getElementById("notificationsDropdown");
      const notificationBtn = document.querySelector(".notification-btn");
      if (notificationBtn && !notificationBtn.contains(e.target) && notificationsDropdown && !notificationsDropdown.contains(e.target)) {
        notificationsDropdown.classList.remove("show");
      }
  
      const userMenuDropdown = document.getElementById("userMenuDropdown");
      const userMenuBtn = document.querySelector(".user-menu-btn");
      if (userMenuBtn && !userMenuBtn.contains(e.target) && userMenuDropdown && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.classList.remove("show");
      }
  
      const searchContainer = document.getElementById("searchContainer");
      const searchBtn = document.querySelector(".search-btn");
      if (searchBtn && !searchBtn.contains(e.target) && searchContainer && !searchContainer.contains(e.target)) {
        searchContainer.classList.remove("show");
      }
    });
  
    // --- LÓGICA PRINCIPAL DO TREINAMENTO ---
  
    // Ocultar tudo exceto informações básicas inicialmente
    conteudoTreinamento.style.display = "none";

    modoCriacaoSelect.addEventListener("change", (e) => {
        conteudoTreinamento.style.display = "block";
        if (e.target.value === "manual") {
            formManual.style.display = "block";
            formVideo.style.display = "none";
            conteudoDiv.innerHTML = "";
        } else if (e.target.value === "automatico") {
            formManual.style.display = "none";
            formVideo.style.display = "block";
        }
    });
  
    // Lógica do Modo Automático
    formVideo.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        showLoading();
        conteudoDiv.innerText = "⏳ Processando vídeo...";
        let dadosTreinamento = null;
  
        try {
            const response = await fetch("/upload-video", {
                method: "POST",
                body: formData
            });
  
            const resultado = await response.json();
  
            if (!resultado || !resultado.treinamento) {
                conteudoDiv.innerHTML = "<p>Erro ao gerar conteúdo.</p>";
                return;
            }
            video_url = resultado.video_url;
            dadosTreinamento = resultado.treinamento;
            renderizarEditor(dadosTreinamento);
  
        } catch (err) {
            alert("Erro ao enviar o vídeo");
            console.error(err);
            conteudoDiv.innerText = "";
        } finally {
            hideLoading();
        }
    });
  
    async function carregarDepartamentos(id_empresa) {
      try {
        const response = await fetch("/list_departamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa })
        });
  
        const departamentos = await response.json();
        const select = document.getElementById("departamento");
        select.innerHTML = '<option value="">Selecione um departamento</option>';
  
        departamentos.forEach(dep => {
          const option = document.createElement("option");
          option.value = dep.id;
          option.textContent = dep.nome;
          select.appendChild(option);
        });
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
      }
    }
    
    carregarDepartamentos(id_empresa);
  
    btnAdicionarTopico.addEventListener("click", () => {
        topicoCounter++;
        const novoTopicoDiv = document.createElement("div");
        novoTopicoDiv.className = "topico topico-manual";
        novoTopicoDiv.id = `topico-${topicoCounter}`;
        novoTopicoDiv.innerHTML = `
            <div class="form-group">
                <label for="titulo-topico-${topicoCounter}">
                    <i class="fas fa-heading"></i>
                    Título do Tópico ${topicoCounter}
                </label>
                <input type="text" id="titulo-topico-${topicoCounter}" class="form-input titulo-topico" placeholder="Digite o título do tópico" required />
            </div>
            <div class="form-group">
                <label for="conteudo-topico-${topicoCounter}">
                    <i class="fas fa-align-left"></i>
                    Conteúdo do Tópico
                </label>
                <textarea id="conteudo-topico-${topicoCounter}" class="form-textarea conteudo-topico" placeholder="Descreva o conteúdo do tópico..."></textarea>
            </div>
            <button type="button" class="btn-remover" data-target="topico-${topicoCounter}">
                <i class="fas fa-trash"></i>
                Remover Tópico
            </button>
        `;
        topicosContainer.appendChild(novoTopicoDiv);
    });
  
    btnAdicionarPergunta.addEventListener("click", () => {
        perguntaCounter++;
        const novaPerguntaDiv = document.createElement("div");
        novaPerguntaDiv.className = "pergunta pergunta-manual";
        novaPerguntaDiv.id = `pergunta-${perguntaCounter}`;
        novaPerguntaDiv.innerHTML = `
            <div class="form-group">
                <label for="pergunta-${perguntaCounter}">
                    <i class="fas fa-question"></i>
                    Pergunta ${perguntaCounter}
                </label>
                <input type="text" id="pergunta-${perguntaCounter}" class="form-input" placeholder="Digite a pergunta" required />
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="opcao-a-${perguntaCounter}">Opção A</label>
                    <input type="text" id="opcao-a-${perguntaCounter}" class="form-input" placeholder="Opção A" required />
                </div>
                <div class="form-group">
                    <label for="opcao-b-${perguntaCounter}">Opção B</label>
                    <input type="text" id="opcao-b-${perguntaCounter}" class="form-input" placeholder="Opção B" required />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="opcao-c-${perguntaCounter}">Opção C</label>
                    <input type="text" id="opcao-c-${perguntaCounter}" class="form-input" placeholder="Opção C" required />
                </div>
                <div class="form-group">
                    <label for="opcao-d-${perguntaCounter}">Opção D</label>
                    <input type="text" id="opcao-d-${perguntaCounter}" class="form-input" placeholder="Opção D" required />
                </div>
            </div>
            <div class="form-group">
                <label for="resposta-correta-${perguntaCounter}">
                    <i class="fas fa-check"></i>
                    Resposta Correta
                </label>
                <select id="resposta-correta-${perguntaCounter}" class="form-select" required>
                    <option value="">Selecione a resposta correta</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
            <button type="button" class="btn-remover" data-target="pergunta-${perguntaCounter}">
                <i class="fas fa-trash"></i>
                Remover Pergunta
            </button>
        `;
        quizContainer.appendChild(novaPerguntaDiv);
    });
  
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-remover")) {
            const targetId = e.target.dataset.target;
            const elementToRemove = document.getElementById(targetId);
            if (elementToRemove) {
                elementToRemove.remove();
            }
        }
    });
  
    btnSalvarManual.addEventListener("click", async () => {
        showLoading();
        try {
            const titulo = document.getElementById("nome").value;
            const descricao = document.getElementById("descricao").value;
            const data_inicio = document.getElementById("data_inicio").value;
            const data_encerramento = document.getElementById("data_encerramento").value;
            const id_departamento = document.getElementById("departamento").value;
            if (!titulo || !descricao || !data_inicio || !data_encerramento || !id_departamento) {
                alert("Preencha todos os campos obrigatórios de Informações Básicas.");
                hideLoading();
                return;
            }
  
            const videoManualInput = document.getElementById("video_manual");
            let videoManualUrl = null;
            if (videoManualInput.files.length > 0) {
                videoManualUrl = "URL_DO_VIDEO_MANUAL_AQUI"; 
            }
  
            const introducao = document.getElementById("introducao").value;
  
            const topicosElements = document.querySelectorAll(".topico-manual");
            const topicos = Array.from(topicosElements).map((el, i) => ({
                titulo: el.querySelector(`.titulo-topico`).value,
                conteudo: el.querySelector(`.conteudo-topico`).value
            }));
  
            const perguntasElements = document.querySelectorAll(".pergunta-manual");
            const quiz = Array.from(perguntasElements).map((el, i) => {
                const pergunta = el.querySelector(`input[id^="pergunta-"]`).value;
                const resposta_correta = el.querySelector(`select[id^="resposta-correta-"]`).value;
                const opcoes = {};
                opcoes.A = el.querySelector(`input[id^="opcao-a-"]`).value;
                opcoes.B = el.querySelector(`input[id^="opcao-b-"]`).value;
                opcoes.C = el.querySelector(`input[id^="opcao-c-"]`).value;
                opcoes.D = el.querySelector(`input[id^="opcao-d-"]`).value;
                return { pergunta, opcoes, resposta_correta };
            });
  
            const conteudo_json = {
                video_url: videoManualUrl,
                resumo: {
                    introducao: introducao,
                    topicos_principais: topicos
                },
                quiz: quiz
            };
  
            const data = {
                id_empresa,
                titulo,
                descricao,
                video_url: videoManualUrl,
                conteudo_json,
                data_inicio,
                data_encerramento,
                id_departamento
            };
  
            fetch("/salvar-treinamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(result => {
                alert("Treinamento salvo com sucesso!");
            })
            .catch(err => {
                alert("Erro ao salvar no banco.");
                console.error(err);
            })
            .finally(() => {
                hideLoading();
            });
        } catch (err) {
            alert("Erro ao processar dados.");
            console.error(err);
            hideLoading();
        }
    });
  
    function renderizarEditor(dadosTreinamento) {
        conteudoDiv.innerHTML = `
            <div class="form-card">
                <div class="form-card-header">
                    <h3><i class="fas fa-info-circle"></i> Informações Geradas</h3>
                </div>
                <div class="form-card-content">
                    <div class="form-group">
                        <label for="introducao-auto">
                            <i class="fas fa-play-circle"></i>
                            Introdução Gerada
                        </label>
                        <textarea id="introducao-auto" class="form-textarea" placeholder="Introdução do treinamento" required>${dadosTreinamento.resumo.introducao}</textarea>
                    </div>

                    <div id="topicos-auto" class="content-section">
                        <div class="section-header">
                            <h4><i class="fas fa-list"></i> Tópicos Gerados</h4>
                        </div>
                        <div id="topicos-container-auto"></div>
                    </div>

                    <div id="quiz-auto" class="content-section">
                        <div class="section-header">
                            <h4><i class="fas fa-question-circle"></i> Quiz Gerado</h4>
                        </div>
                        <div id="quiz-container-auto"></div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" id="btnSalvarAutomatico" class="btn-primary">
                    <i class="fas fa-save"></i>
                    Salvar Treinamento Automático
                </button>
            </div>
        `;

        const topicosContainerAuto = document.getElementById("topicos-container-auto");
        dadosTreinamento.resumo.topicos_principais.forEach((topico, index) => {
            const topicoAutoDiv = document.createElement("div");
            topicoAutoDiv.className = "topico topico-auto";
            topicoAutoDiv.innerHTML = `
                <div class="form-group">
                    <label for="titulo_${index}">
                        <i class="fas fa-heading"></i>
                        Título do Tópico ${index + 1}
                    </label>
                    <input type="text" name="titulo_${index}" class="form-input" value="${topico.titulo}" required />
                </div>
                <div class="form-group">
                    <label for="conteudo_${index}">
                        <i class="fas fa-align-left"></i>
                        Conteúdo do Tópico
                    </label>
                    <textarea name="conteudo_${index}" class="form-textarea" required>${topico.conteudo}</textarea>
                </div>
            `;
            topicosContainerAuto.appendChild(topicoAutoDiv);
        });

        const quizContainerAuto = document.getElementById("quiz-container-auto");
        dadosTreinamento.quiz.forEach((pergunta, index) => {
            const perguntaAutoDiv = document.createElement("div");
            perguntaAutoDiv.className = "pergunta pergunta-auto";
            perguntaAutoDiv.innerHTML = `
                <div class="form-group">
                    <label for="pergunta_${index}">
                        <i class="fas fa-question"></i>
                        Pergunta ${index + 1}
                    </label>
                    <input type="text" name="pergunta_${index}" class="form-input" value="${pergunta.pergunta}" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="opcao_${index}_A">Opção A</label>
                        <input type="text" name="opcao_${index}_A" class="form-input" value="${pergunta.opcoes.A}" required />
                    </div>
                    <div class="form-group">
                        <label for="opcao_${index}_B">Opção B</label>
                        <input type="text" name="opcao_${index}_B" class="form-input" value="${pergunta.opcoes.B}" required />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="opcao_${index}_C">Opção C</label>
                        <input type="text" name="opcao_${index}_C" class="form-input" value="${pergunta.opcoes.C}" required />
                    </div>
                    <div class="form-group">
                        <label for="opcao_${index}_D">Opção D</label>
                        <input type="text" name="opcao_${index}_D" class="form-input" value="${pergunta.opcoes.D}" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="resposta_${index}">
                        <i class="fas fa-check"></i>
                        Resposta Correta
                    </label>
                    <select name="resposta_${index}" class="form-select" required>
                        <option value="">Selecione a resposta correta</option>
                        <option value="A" ${pergunta.resposta_correta === "A" ? "selected" : ""}>A</option>
                        <option value="B" ${pergunta.resposta_correta === "B" ? "selected" : ""}>B</option>
                        <option value="C" ${pergunta.resposta_correta === "C" ? "selected" : ""}>C</option>
                        <option value="D" ${pergunta.resposta_correta === "D" ? "selected" : ""}>D</option>
                    </select>
                </div>
            `;
            quizContainerAuto.appendChild(perguntaAutoDiv);
        });

        document.getElementById("btnSalvarAutomatico").addEventListener("click", async () => {
            showLoading();
            try {
                const titulo = document.getElementById("nome").value;
                const descricao = document.getElementById("descricao").value;
                const data_inicio = document.getElementById("data_inicio").value;
                const data_encerramento = document.getElementById("data_encerramento").value;
                const id_departamento = document.getElementById("departamento").value;
                if (!titulo || !descricao || !data_inicio || !data_encerramento) {
                    alert("Preencha os campos Nome, Descrição e Datas antes de salvar o treinamento gerado.");
                    return;
                }
                
                const introducao = document.getElementById("introducao-auto").value;
      
                const topicosElements = document.querySelectorAll("#topicos-auto .topico");
                const topicos = Array.from(topicosElements).map((el, i) => ({
                    titulo: el.querySelector(`input[name="titulo_${i}"]`).value,
                    conteudo: el.querySelector(`textarea[name="conteudo_${i}"]`).value
                }));
      
                const perguntasElements = document.querySelectorAll("#quiz-auto .pergunta");
                const quiz = Array.from(perguntasElements).map((el, i) => {
                    const pergunta = el.querySelector(`input[name="pergunta_${i}"]`).value;
                    const resposta_correta = el.querySelector(`select[name="resposta_${i}"]`).value;
                    const opcoes = {};
                    ["A", "B", "C", "D"].forEach(letra => {
                        const input = el.querySelector(`input[name="opcao_${i}_${letra}"]`);
                        if (input) opcoes[letra] = input.value;
                    });
                    return { pergunta, opcoes, resposta_correta };
                });
      
                const conteudo_json = {
                    resumo: {
                        introducao: introducao,
                        topicos_principais: topicos
                    },
                    quiz: quiz
                };
      
                const data = {
                    id_empresa,
                    titulo,
                    descricao,
                    video_url,
                    conteudo_json,
                    data_inicio,
                    data_encerramento,
                    id_departamento
                };
      
                fetch("/salvar-treinamento", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(result => {
                    alert("Treinamento salvo com sucesso!");
                    conteudoDiv.innerHTML = "";
                })
                .catch(err => {
                    alert("Erro ao salvar no banco.");
                    console.error(err);
                })
                .finally(() => {
                    hideLoading();
                });
            } catch (err) {
                alert("Erro ao processar dados.");
                console.error(err);
                hideLoading();
            }
        });
    }
  
    function showLoading() {
        const loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.classList.add("show");
    }
  
    function hideLoading() {
        const loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.classList.remove("show");
    }
  });
  
  async function loadUserData() {
    const id_empresa = sessionStorage.getItem("id_empresa")
    try {
      const response = await fetch(`/empresa_data?id=${id_empresa}`);
  
      const data = await response.json();
  
      const welcomeText = document.getElementById("boasVindas"); 
      const companyName = document.getElementById("nome_empresa");
      const footer_empresa_name = document.getElementById("footer_empresa_name");
  
      if (welcomeText) welcomeText.innerText = `Bem-vindo ${data.nome}`;
      if (companyName) companyName.innerText = data.nome;
      if (footer_empresa_name) footer_empresa_name.textContent = `${data.nome}`;
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
    }
  }
