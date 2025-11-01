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

    // Definir limites no input de idade (ajuda na UI)
    const inputIdade = document.getElementById('idade');
    if (inputIdade) {
      inputIdade.setAttribute('min', '0');
      inputIdade.setAttribute('max', '120');
    }

    const inputBanheiro = document.getElementById('banheiro');
    if (inputBanheiro) {
      inputBanheiro.setAttribute('min', '0');
      inputBanheiro.setAttribute('max', '20');
    }

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
      const nomeVal = document.getElementById('nome').value.trim();
      const idadeRaw = document.getElementById('idade').value.trim();
      const idadeVal = parseInt(idadeRaw, 10);

      const MIN_IDADE = 0;
      const MAX_IDADE = 120;

      if (!nomeVal) {
        alert('Por favor insira o nome do idoso.');
        document.getElementById('nome').focus();
        return;
      }

      if (isNaN(idadeVal) || idadeVal < MIN_IDADE || idadeVal > MAX_IDADE) {
        alert(`Idade inválida. Insira um valor entre ${MIN_IDADE} e ${MAX_IDADE}.`);
        document.getElementById('idade').focus();
        return;
      }

      const novoIdoso = {
        nome: nomeVal,
        idade: idadeVal
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
        if (r.statusTemp === "Hipotermia") corTemp = "#8e44ad"; // roxo
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

      // Validação do número de idas ao banheiro
      const banheiroRaw = document.getElementById('banheiro').value.trim();
      const banheiroVal = parseInt(banheiroRaw, 10);
      const MIN_BANHEIRO = 0;
      const MAX_BANHEIRO = 20;
      if (isNaN(banheiroVal) || banheiroVal < MIN_BANHEIRO || banheiroVal > MAX_BANHEIRO) {
        alert(`Número de idas ao banheiro inválido. Insira um valor entre ${MIN_BANHEIRO} e ${MAX_BANHEIRO}.`);
        document.getElementById('banheiro').focus();
        return;
      }

      // Classificação da temperatura
      let statusTemp = "Normal";
      if (temp < 35) {
          statusTemp = "Hipotermia";
        } else if (temp >= 37.3 && temp <= 37.8) {
           statusTemp = "Febril";
        } else if (temp >= 37.9 && temp <= 39) {
          statusTemp = "Febre";
        } else if (temp > 39) {
          statusTemp = "Febre Alta";
        }

      const refeicoesSelecionadas = Array.from(document.querySelectorAll('input[name="refeicao"]:checked'))
                                   .map(r => r.value)
                                   .join(', ');

      const novoRegistro = {
        data: new Date().toLocaleString(),
        pressao: document.getElementById('pressao').value,
        temperatura: temp,
        statusTemp: statusTemp,
        obs: document.getElementById('obs').value,
        refeicao: refeicoesSelecionadas || "Nenhuma refeição marcada",
        banheiro: banheiroVal
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

// Filtrar histórico

function filtrarHistorico() {
  const dataFiltro = document.getElementById('filtroData').value.toLowerCase();
  const tempFiltro = document.getElementById('filtroTemp').value;
  const pressaoFiltro = document.getElementById('filtroPressao').value.toLowerCase();

  const registros = JSON.parse(localStorage.getItem(`registros_${idosoAtual}`)) || [];
  historicoDiv.innerHTML = "";

  registros.forEach((r, index) => {
  let combina = true;

  if (dataFiltro && !r.data.toLowerCase().includes  (dataFiltro)) combina = false;
  if (tempFiltro && r.statusTemp !== tempFiltro) combina = false;
  if (pressaoFiltro && !r.pressao.toLowerCase().includes(pressaoFiltro)) combina = false;

if (combina) {
  historicoDiv.innerHTML += `
    <div class="registro">
      <p><b>Data:</b> ${r.data}</p>
      <p><b>Pressão arterial:</b> ${r.pressao}</p>
      <p><b>Temperatura:</b> ${r.temperatura} °C (${r.statusTemp})</p>
      <p><b>Observações:</b> ${r.obs}</p>
      <p><b>Refeição:</b> ${r.refeicao}</p>
      <p><b>Banheiro:</b> ${r.banheiro} vezes</p>
      <button class="btn-delete" onclick="deletarRegistro(${index})">Excluir Registro</button>
    </div>
  `;
}
});

if (historicoDiv.innerHTML === "") {
  historicoDiv.innerHTML = "<p style='text-align:center;color:#888;'>Nenhum registro encontrado com os filtros aplicados.</p>";
}
}

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

  if (temp < 35) {
    status = "Hipotermia"; cor = "#8e44ad"; // roxo
  } else if (temp >= 37.3 && temp <= 37.8) {
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

document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("active");
  });
});

