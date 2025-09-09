    // botão do menu lateal
    function toggleMenu() {
      document.getElementById("sidebar").classList.toggle("collapsed");
    }

    // Navegação
    function mostrarPagina(pagina) {
      document.querySelectorAll('.pagina').forEach(sec => sec.classList.add('hidden'));
      document.getElementById(pagina).classList.remove('hidden');
    }

    // Variáveis
    const formIdoso = document.getElementById('formIdoso');
    const listaDiv = document.getElementById('listaIdosos');
    const agendaSection = document.getElementById('agendaSection');
    const tituloAgenda = document.getElementById('tituloAgenda');
    const historicoDiv = document.getElementById('historico');
    const formRegistro = document.getElementById('formRegistro');
    let idosoAtual = null;

    // Lista de Idosos que nos cadastramos
    function carregarIdosos() {
      const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
      listaDiv.innerHTML = "";
      idosos.forEach((i, index) => {
        listaDiv.innerHTML += `
          <div class="idoso">
            <p><b>Nome:</b> ${i.nome}</p>
            <p><b>Idade:</b> ${i.idade}</p>
            <button class="btn-open" onclick="abrirAgenda(${index})">Abrir Agenda</button>
            <button class="btn-delete" onclick="deletarIdoso(${index})">Excluir</button>
          </div>
        `;
      });
    }

    formIdoso.addEventListener('submit', e => {
      e.preventDefault();
      const novoIdoso = {
        nome: document.getElementById('nome').value,
        idade: document.getElementById('idade').value
      };
      const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
      idosos.push(novoIdoso);
      localStorage.setItem('idosos', JSON.stringify(idosos));
      formIdoso.reset();
      carregarIdosos();
    });

    // Agenda
    function abrirAgenda(index) {
      const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
      idosoAtual = index;
      const idoso = idosos[index];
      tituloAgenda.innerText = "Agenda de " + idoso.nome;

      formIdoso.style.display = "none";
      listaDiv.style.display = "none";
      agendaSection.classList.remove("hidden");

      carregarHistorico();
    }

    function voltarLista() {
      agendaSection.classList.add("hidden");
      formIdoso.style.display = "block";
      listaDiv.style.display = "block";
    }

    function carregarHistorico() {
      const registros = JSON.parse(localStorage.getItem(`registros_${idosoAtual}`)) || [];
      historicoDiv.innerHTML = "";
      registros.forEach((r, index) => {
        // Definir cor conforme statusTemp
        let corTemp = "#2ecc71"; // verde (Normal)
        if (r.statusTemp === "Febril") corTemp = "#e67e22";     // laranja
        if (r.statusTemp === "Febre") corTemp = "#e74c3c";      // vermelho
        if (r.statusTemp === "Febre Alta") corTemp = "#c0392b"; //      vermelho escuro


        historicoDiv.innerHTML += `
          <div class="registro">
            <p><b>Data:</b> ${r.data}</p>
            <p><b>Pressão arterial:</b> ${r.pressao}</p>
            <p><b>Temperatura:</b> <span style="color:${corTemp}; font-weight:bold;">
            ${r.temperatura} °C (${r.statusTemp})
            </span></p>
            <p><b>Observações:</b> ${r.obs}</p>
            <p><b>Refeição:</b> ${r.refeicao}</p>
            <p><b>Banheiro:</b> ${r.banheiro} vezes</p>
            <button class="btn-delete" onclick="deletarRegistro(${index})">Excluir Registro</button>
          </div>
        `;
      });
    }

    formRegistro.addEventListener('submit', e => {
      e.preventDefault();

      const temp = parseFloat(document.getElementById('temperatura').value);

      // Classificação da temperatura
      let statusTemp = "Normal";
        if (temp >= 37.3 && temp <= 37.8) {
           statusTemp = "Febril";
        } else if (temp >= 37.9 && temp <= 39) {
          statusTemp = "Febre";
        } else if (temp > 39) {
          statusTemp = "Febre Alta";
        }

      const novoRegistro = {
        data: new Date().toLocaleString(),
        pressao: document.getElementById('pressao').value,
        temperatura: temp,
        statusTemp: statusTemp,
        obs: document.getElementById('obs').value,
        refeicao: document.getElementById('refeicao').value,
        banheiro: document.getElementById('banheiro').value
      };

      // ⚠️ AVISO PARA O CUIDADOR (aqui é o ponto certo)
        if (statusTemp !== "Normal") {
          const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
          const nomeIdoso = idosos[idosoAtual]?.nome || "Idoso";
          alert(`⚠️ Atenção: ${nomeIdoso} está com ${statusTemp} (${temp} °C).`);
        }

        
      const registros = JSON.parse(localStorage.getItem(`registros_${idosoAtual}`)) || [];
      registros.push(novoRegistro);
      localStorage.setItem(`registros_${idosoAtual}`, JSON.stringify(registros));
      formRegistro.reset();
      document.getElementById("tempOutput").value = "36.5"; 
      document.getElementById("temperatura").value = "36.5";
      carregarHistorico();
    });

    // Deletar o que não for do agrado ou se voce quiser kkkkk
    function deletarIdoso(index) {
      if (confirm("Excluir este idoso e toda sua agenda?")) {
        let idosos = JSON.parse(localStorage.getItem('idosos')) || [];
        idosos.splice(index, 1);
        localStorage.setItem('idosos', JSON.stringify(idosos));
        localStorage.removeItem(`registros_${index}`);
        carregarIdosos();
        voltarLista();
      }
    }

    function deletarRegistro(index) {
      if (confirm("Excluir este registro?")) {
        let registros = JSON.parse(localStorage.getItem(`registros_${idosoAtual}`)) || [];
        registros.splice(index, 1);
        localStorage.setItem(`registros_${idosoAtual}`, JSON.stringify(registros));
        carregarHistorico();
      }
    }


    // nome ja fala por si ne, tu vai sair e ir para area de login
    function sair() {
      if (confirm("Deseja realmente sair?")) {
        // remove o nome do usuário
        localStorage.removeItem("usuarioLogado");
        // redireciona para a tela de login
        window.location.href = "tela_login/login.html"; 
      }
    }


    // Inicializa lista de idosos ao carregar a página
    carregarIdosos();

    // Mensagem de boas-vindas
  window.onload = function() {
  let nome = localStorage.getItem("email");
  if (nome) {
    document.getElementById("boasVindas").textContent = "Olá " + nome + ", bem-vindo ao Ajuda+!";
  }

  // Atualiza total de idosos
  let idosos = JSON.parse(localStorage.getItem('idosos')) || [];
  document.getElementById("totalIdosos").textContent = idosos.length;

  // Soma total de registros de todos os idosos
  let totalRegistros = 0;
  idosos.forEach((idoso, index) => {
    let registros = JSON.parse(localStorage.getItem(`registros_${index}`)) || [];
    totalRegistros += registros.length;
  });
  document.getElementById("registrosHoje").textContent = totalRegistros;

  // Gráfico de idosos cadastrados e registros
  const ctx = document.getElementById('graficoIdosos').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Idosos cadastrados', 'Registros'],
      datasets: [{
        data: [idosos.length, totalRegistros],
        backgroundColor: ['#27ae60', '#2980b9']
      }]
    },
    options: {
      plugins: { legend: { display: true } }
    }
  });
  
  };

// Atualizar status da temperatura em tempo real enquanto o usuário ajusta a barra

document.getElementById("temperatura").addEventListener("input", function() {
  const temp = parseFloat(this.value);
  let status = "Normal";
  let cor = "#2ecc71"; // verde

  if (temp >= 37.3 && temp <= 37.8) {
    status = "Febril"; cor = "#e67e22"; // laranja
  } else if (temp >= 37.9 && temp <= 39) {
    status = "Febre"; cor = "#e74c3c"; // vermelho
  } else if (temp > 39) {
    status = "Febre Alta"; cor = "#c0392b"; // vermelho escuro
  }

  const output = document.getElementById("tempOutput");
  output.innerHTML = `${temp.toFixed(1)} °C (${status})`;
  output.style.color = cor;
});
