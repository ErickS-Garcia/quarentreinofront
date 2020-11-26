let tableState = '';

const treinosColumns = [
  { title: 'ID', data: '_id', visible: false },
  { title: 'Nome', data: 'nome' },
  // { title: 'Nome Professor', data: 'professor.nome' },
  // { title: 'Sobrenome Professor', data: 'professor.sobrenome' },
  { title: 'Nome Aluno', data: 'aluno.nome' },
  { title: 'Sobrenome Aluno', data: 'aluno.sobrenome' },
  { title: 'Criação', data: 'created', render: data => moment(data).format('DD/MM/YYYY') }
];

const alunosColumns = [
  { title: 'ID', data: '_id', visible: false },
  { title: 'Nome', data: 'nome' },
  { title: 'Sobrenome', data: 'sobrenome' },
  { title: 'Email', data: 'email' },
  { title: 'Nascimento', data: 'nascimento', render: data => moment(data).format('DD/MM/YYYY') },
  { title: 'Telefone', data: 'telefone' }
];

$(document).ready(() => {
  loadingIcon(true);
  const treinosTable = createTable('#treinosTable', {
    ajax: { url: '/treinos', dataSrc: '' },
    columns: treinosColumns
  });

  // $('#alunosRow').hide();
  const alunosTable = createTable('#alunosTable', {
    ajax: { url: '/professor/alunos', dataSrc: '' },
    columns: alunosColumns
  }).on('init', () => {
    $('#alunosRow').hide();
    loadingIcon(false);
  });

  treinosTable.on('click', 'tbody tr', function () {
    const { _id } = treinosTable.row(this).data();
    window.location = `/treinos/${_id}`;
  });

  alunosTable.on('click', 'tbody tr', function () {
    const { _id } = alunosTable.row(this).data();
    window.location = `/alunos/${_id}`;
  });

  $('input:radio[name="options"]').on('change', e => {
    $('div.col-12[id$="Row"]').hide();
    $(`#${e.target.id}Row`).show();
  });

  window.treinosTable = treinosTable;
  window.alunosTable = alunosTable;
});

const createTable = (id, options) => {
  return $(id).DataTable({
    paging: true,
    order: [1, 'asc'],
    paging: false,
    info: false,
    language: {
      sEmptyTable: 'Nenhum registro encontrado',
      sInfo: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
      sInfoEmpty: 'Mostrando 0 até 0 de 0 registros',
      sInfoFiltered: '(Filtrados de _MAX_ registros)',
      sInfoPostFix: '',
      sInfoThousands: '.',
      sLengthMenu: '_MENU_ resultados por página',
      sLoadingRecords: 'Carregando...',
      sProcessing: 'Processando...',
      sZeroRecords: 'Nenhum registro encontrado',
      sSearch: 'Pesquisar',
      oPaginate: {
        sNext: 'Próximo',
        sPrevious: 'Anterior',
        sFirst: 'Primeiro',
        sLast: 'Último'
      },
      oAria: {
        sSortAscending: ': Ordenar colunas de forma ascendente',
        sSortDescending: ': Ordenar colunas de forma descendente'
      }
    },
    ...options
  });
};
