document.addEventListener('DOMContentLoaded', () => {
  const filtroGeralInput = document.getElementById('filtroGeral');
  const btnExportarCSV = document.getElementById('btnExportarCSV');
  const tbody = document.querySelector('tbody');

  let todosRegistros = [];

  async function carregarRegistros() {
    const res = await fetch('/api/registros');
    todosRegistros = await res.json();
    renderTabela(todosRegistros);
  }

  function renderTabela(data) {
    tbody.innerHTML = '';
    data.forEach(item => {
      const tr = document.createElement('tr');
      Object.values(item).forEach(v => {
        const td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function filtrarGlobal() {
    const termo = filtroGeralInput.value.trim().toLowerCase();
    const filtrados = todosRegistros.filter(row =>
      Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(termo)
      )
    );
    renderTabela(filtrados);
  }

  filtroGeralInput.addEventListener('input', filtrarGlobal);

  btnExportarCSV.addEventListener('click', () => {
    const termo = filtroGeralInput.value.trim().toLowerCase();
    const filtrados = todosRegistros.filter(row =>
      Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(termo)
      )
    );

    if (!filtrados.length) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const csv = [Object.keys(filtrados[0]).join(',')]
      .concat(filtrados.map(r => Object.values(r).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'registros_filtrados.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  carregarRegistros();
});
