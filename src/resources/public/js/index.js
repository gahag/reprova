function table_build_section(rows, container_elem, row_elem, cell_elem) {
  function str_or_obj(x) {
    x = typeof x === 'string' ? { name: x } : x;

    x.className = x.className || '';

    return x;
  };

  var container_elem = str_or_obj(container_elem);
  var row_elem = str_or_obj(row_elem);
  var cell_elem = str_or_obj(cell_elem);

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
    [ { text: 'Questions', colSpan: '4' } ],
    [ 'Description', 'Theme', 'Record', 'Private' ]
  ];
  let rows = data.map(
    q => {
      let description = document.createElement('a');
      description.appendChild(document.createTextNode(q.description));
      description.href = '#';
      description.onclick = async () => {
        const request = await fetch('http://localhost:8080/api/questions?id=' + q.id);
        const response = await request.json();

        console.log(response);
      };

      // let record = document.createElement('table');
      // record.appendChild(
      //   table_build_section(
      //     rows,
      //     'tbody',
      //     'tr',
      //     { name: 'td', className: 'questions-cell' }
      //   )
      // );
      
      return [ { elem: description }, q.theme, 'record', q.pvt ];
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


async function loadQuestions() {
  const request = await fetch('http://localhost:8080/api/questions');
  const response = await request.json();

  console.log(response);

  let table = questionsTable(response);
  table.id = 'questions';

  $('#root').append(table);

  $('#questions').DataTable();
}

$(document).ready(loadQuestions);
