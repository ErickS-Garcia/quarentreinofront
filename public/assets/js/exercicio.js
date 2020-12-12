
const exerciciosColumns = [
  { title: 'ID', data: '_id', visible: false },

  { title: 'Nome do exercício', data: 'nome' },
  { title: 'Descrição do exercício', data: 'descricao' },
  { title: 'Observações', data: 'observacoes' },
];

$(document).ready(() => {
  const exerciciosTable = createTable('#exerciciosTable', {
    ajax: { url: '/exercicios', dataSrc: '' },
    columns: exerciciosColumns
  });

  exerciciosTable.on('click', 'tbody tr', function () {
    const { _id } = exerciciosTable.row(this).data();
    window.location = `/exercicios/${_id}`;
  });

  $('input:radio[name="options"]').on('change', e => {
    $('div.col-12[id$="Row"]').hide();
    $(`#${e.target.id}Row`).show();
  });

  window.exerciciosTable = exerciciosTable;
});

