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

            <div class="registro-block">
              <h4>Alimentação</h4>
              <p><b>Refeições:</b> ${r.refeicao || 'Nenhuma'}</p>
            </div>

            <div class="registro-block">
              <h4>Higiene</h4>
              <p>Banho: ${r.higiene?.banho ? 'Sim' : 'Não'}</p>
              <p>Escovação: ${r.higiene?.escovacao ? 'Sim' : 'Não'}</p>
              <p>Trocar fralda: ${r.higiene?.trocarFralda ? 'Sim' : 'Não'}</p>
              <p><b>Observações:</b> ${r.higiene?.higieneObs || '-'}</p>
              <p><b>Idas ao banheiro:</b> ${r.banheiro || 0} vezes</p>
            </div>

            <div class="registro-block">
              <h4>Saúde</h4>
              <p><b>Pressão arterial:</b> ${r.pressao}</p>
              <p><b>Temperatura:</b> <span style="color:${corTemp}; font-weight:bold;">${r.temperatura} °C (${r.statusTemp})</span></p>
              <p><b>Medicação:</b> ${r.saude?.medicacao || '-'}</p>
              <p><b>Dosagem:</b> ${r.saude?.dosagem || '-'}</p>
              <p><b>Medicação tomada:</b> ${r.saude?.medTomada ? 'Sim' : 'Não'}</p>
              <p><b>Observações gerais:</b> ${r.obs || '-'}</p>
              <button class="btn-delete" onclick="deletarRegistro(${index})">Excluir Registro</button>
            </div>
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

      const refeicoesSelecionadas = Array.from(document.querySelectorAll('input[name="refeicao"]:checked'))
                                   .map(r => r.value)
                                   .join(', ');

      // Campos de higiene
      const banho = document.getElementById('banho') ? document.getElementById('banho').checked : false;
      const escovacao = document.getElementById('escovacao') ? document.getElementById('escovacao').checked : false;
      const trocarFralda = document.getElementById('trocarFralda') ? document.getElementById('trocarFralda').checked : false;
      const higieneObs = document.getElementById('higieneObs') ? document.getElementById('higieneObs').value : '';

      // Campos de medicação
      const medicacao = document.getElementById('medicacao') ? document.getElementById('medicacao').value : '';
      const dosagem = document.getElementById('dosagem') ? document.getElementById('dosagem').value : '';
      const medTomada = document.getElementById('medTomada') ? document.getElementById('medTomada').checked : false;

      const novoRegistro = {
        data: new Date().toLocaleString(),
        // campos já usados por filtros e compatibilidade
        pressao: document.getElementById('pressao').value,
        temperatura: temp,
        statusTemp: statusTemp,
        obs: document.getElementById('obs').value,
        refeicao: refeicoesSelecionadas || "Nenhuma refeição marcada",
        banheiro: document.getElementById('banheiro').value,
        // estrutura nova
        higiene: { banho, escovacao, trocarFralda, higieneObs },
        saude: { medicacao, dosagem, medTomada }
      };

      // ⚠️ AVISO PARA O CUIDADOR
      if (statusTemp !== "Normal") {
        const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
        const nomeIdoso = idosos[idosoAtual]?.nome || "Idoso";
        alert(`⚠️ Atenção: ${nomeIdoso} está com ${statusTemp} (${temp} °C).`);
      }

      const registros = JSON.parse(localStorage.getItem(`registros_${idosoAtual}`)) || [];
      registros.push(novoRegistro);
      localStorage.setItem(`registros_${idosoAtual}`, JSON.stringify(registros));
      formRegistro.reset();
      const output = document.getElementById("tempOutput");
      if (output) output.innerHTML = "36.5 °C (Normal)";
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

document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("active");
  });
});

// Função para exportar a seção da agenda como PDF usando html2pdf
function exportToPDF() {
  const elemento = document.getElementById('agenda');
  if (!elemento) {
    alert('Abra a agenda de um idoso antes de gerar o PDF.');
    return;
  }

  // Obter nome do idoso para cabeçalho e filename
  const idosos = JSON.parse(localStorage.getItem('idosos')) || [];
  const nomeIdoso = (typeof idosoAtual === 'number' && idosos[idosoAtual]) ? idosos[idosoAtual].nome : tituloAgenda?.innerText || 'agenda';
  const dataAgora = new Date().toLocaleString();
  const nomeArquivo = (nomeIdoso.replace(/\s+/g, '_') || 'agenda') + '_' + (new Date()).toISOString().slice(0,10) + '.pdf';

  const opcoes = {
    margin:       0.4,
    filename:     nomeArquivo,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  // Clonar o elemento para adicionar um cabeçalho temporário antes de gerar o PDF
  const clone = elemento.cloneNode(true);
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '8px';
  header.innerHTML = `<h2 style="margin:0;">${nomeIdoso}</h2><div style="font-size:0.9em;color:#444;">Gerado em: ${dataAgora}</div><hr/>`;
  clone.insertBefore(header, clone.firstChild);

  // Colocar clone em container temporário (necessário para html2pdf)
  const temp = document.createElement('div');
  temp.style.position = 'fixed';
  temp.style.left = '-9999px';
  temp.appendChild(clone);
  document.body.appendChild(temp);

  html2pdf().set(opcoes).from(clone).save().then(() => {
    // remover container temporário
    document.body.removeChild(temp);
  }).catch(() => {
    document.body.removeChild(temp);
  });
}

// Navegação rápida: rola para a seção desejada
function goToSection(section) {
  const el = document.getElementById('panel-' + section);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // focar no primeiro input/textarea dentro do painel para melhor UX
  const focusable = el.querySelector('input, textarea, select, button');
  if (focusable) focusable.focus();
}
// (Modais e abas removidos — os três blocos são exibidos sempre)
