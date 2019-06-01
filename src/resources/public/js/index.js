function table_build_section(rows, container_elem, row_elem, cell_elem) {
  function str_or_obj(x) {
    x = typeof x === 'string' ? { name: x } : x;

    x.className = x.className || '';

    return x;
  };

  container_elem = str_or_obj(container_elem);
  row_elem = str_or_obj(row_elem);
  cell_elem = str_or_obj(cell_elem);

  let container = document.createElement(container_elem.name);
  container.className = container_elem.className;

  for (row of rows) {
    let row_container = document.createElement(row_elem.name);
    row_container.className = row_elem.className;

    for (cell of row) {
      let cell_container = document.createElement(cell_elem.name);
      cell_container.className = cell_elem.className;
      cell_container.colSpan = cell.colSpan || '1';

      if (cell.elem)
        cell_container.appendChild(cell.elem);
      else
        cell_container.appendChild(document.createTextNode(cell.text || cell));

      row_container.appendChild(cell_container);
    }

    container.appendChild(row_container);
  }

  return container;
}

function questionsTable(data) {
  let headers = [
    [ { text: 'Questions', colSpan: '5' } ],
    [ 'Description', 'Theme', 'Record', 'Private', 'Actions' ]
  ];
  let rows = data.map(
    q => {
      // let record = document.createElement('table');
      // record.appendChild(
      //   table_build_section(
      //     rows,
      //     'tbody',
      //     'tr',
      //     { name: 'td', className: 'questions-cell' }
      //   )
      // );

      let download = document.createElement('button');
      download.appendChild(document.createTextNode('Download'));
      download.type = 'button';
      download.onclick = () => downloadQuestion(q.id);

      let remove = document.createElement('button');
      remove.appendChild(document.createTextNode('Remove'));
      remove.type = 'button';
      remove.onclick = () => removeQuestion(q.id);

      let actions = document.createElement('div');
      actions.appendChild(download);
      actions.appendChild(remove);
      // actions.appendChild(edit);

      return [
        q.description,
        q.theme,
        'record',
        q.pvt,
        { elem: actions }
      ];
    }
  );


  let table = document.createElement('table');
  table.className = 'questions';

  table.appendChild(
    table_build_section(
      headers,
      'thead',
      'tr',
      { name: 'th', className: 'questions-header' }
    )
  );
  table.appendChild(
    table_build_section(
      rows,
      'tbody',
      'tr',
      { name: 'td', className: 'questions-cell' }
    )
  );

  return table;
}


async function downloadQuestion(id) {
  const response = await fetch(
    'http://localhost:8080/api/questions?token=' + token + '&id=' + id
  );
  const question = await response.json();

  // TODO decompress and download.

  console.log(question); // TODO
}

async function removeQuestion(id) {
  const response = await fetch(
    'http://localhost:8080/api/questions?token=' + token + '&id=' + id,
    { method: 'delete' }
  );

  if (response.ok)
    refresh();
  else
    alert('Failed to delete question!');
}

async function loadQuestions() {
  const request = await fetch('http://localhost:8080/api/questions?token=' + token);
  const response = await request.json();

  console.log(response);

  let table = questionsTable(response);
  table.id = 'questions';

  $('#root').append(table);

  return $('#questions').DataTable();
}

async function refresh() {
  questionsDataTable.destroy(); // remove datatable.

  $('#questions').remove(); // remove table.

  questionsDataTable = await loadQuestions(); // rebuild table.
}


var url = new URL(window.location.href);
var token = url.searchParams.get("token");

var questionsDataTable;

$(document).ready(async () => {
  questionsDataTable = await loadQuestions();
});
