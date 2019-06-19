function mean(arr) {
  if (arr.length == 0)
    return 0;

  let sum = arr.reduce((a, b) => a + b);

  return sum / arr.length;
}


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
  const headers = [
    [ { text: 'Questions', colSpan: '5' } ],
    token ? [ 'Description', 'Theme', 'Record', 'Private', 'Actions' ]
          : [ 'Description', 'Theme', 'Difficulty', 'Actions' ]
  ];
  const rows = data.map(
    q => {
      // wordwrap works better if the element is enclosed by a div.
      let description = document.createElement('div');
      description.className = 'description';
      description.appendChild(document.createTextNode(q.description));

      let actions = document.createElement('div');

      let download = document.createElement('button');
      download.appendChild(document.createTextNode('Download'));
      download.type = 'button';
      download.onclick = () => downloadQuestion(q.id);
      actions.appendChild(download);

      if (token) {
        let remove = document.createElement('button');
        remove.appendChild(document.createTextNode('Remove'));
        remove.type = 'button';
        remove.onclick = () => {
          if (confirm('Remove question?'))
            removeQuestion(q.id);
        };
        actions.appendChild(remove);

        let edit = document.createElement('button');
        edit.appendChild(document.createTextNode('Edit'));
        edit.type = 'button';
        edit.onclick = () => editQuestion(q.id);
        actions.appendChild(edit);

        let record = document.createElement('div');
        for (semester in q.record) {
          const grades = Object.entries(q.record[semester]);

          let table = document.createElement('table');
          table.className = 'record-table';

          table.appendChild(
            table_build_section(
              [[ { text: semester, colSpan: '2' } ]],
              'thead',
              'tr',
              'th'
            )
          );
          table.appendChild(
            table_build_section(grades, 'tbody', 'tr', 'td')
          );

          record.appendChild(table);
        }

        return [
          { elem: description },
          q.theme,
          { elem: record },
          q.pvt,
          { elem: actions }
        ];
      }
      else {
        const record = mean(
          Object
            .values(q.record)
            .flatMap(Object.values)
        );

        const difficulty = record < 33.3 ? 'Hard'
                         : record < 66.6 ? 'Medium'
                         : 'Easy';

        return [
          { elem: description },
          q.theme,
          difficulty,
          { elem: actions }
        ];
      }
    }
  );


  let table = document.createElement('table');
  table.className = 'questions-table';

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
  const request = await fetch(
    '/api/questions?token=' + token + '&id=' + id
  );
  const question = await request.json();

  const statement = question.statement;
  const separator = statement.indexOf('/');
  const filename  = statement.substring(0, separator);
  const payload   = statement.substring(separator + 1);

  let download = document.createElement('a');
  download.href = payload;
  download.download = filename;
  document.body.appendChild(download);
  download.click();
  download.remove();
}

async function removeQuestion(id) {
  const request = await fetch(
    '/api/questions?token=' + token + '&id=' + id,
    { method: 'delete' }
  );

  if (request.ok)
    refresh();
  else
    alert('Failed to delete question!');
}

function editQuestion(id) {
  let location = '/question.html?id=' + id;

  if (token)
    location += '&token=' + token;

  window.location = location;
};

async function loadQuestions() {
  const request = await fetch('/api/questions?token=' + token);
  const response = await request.json();

  let table = questionsTable(response);
  table.id = 'questions';

  $('#root').append(table);

  return $('#questions').DataTable(
    {
      'columnDefs': [
        {
          'max-width': '35%',
          'targets': 0
        }
      ],
    }
  );
}

async function refresh() {
  questionsDataTable.destroy(); // remove datatable.

  $('#questions').remove(); // remove table.

  questionsDataTable = await loadQuestions(); // rebuild table.
}


const url = new URL(window.location.href);
const token = url.searchParams.get("token");

let questionsDataTable;

$(document).ready(
  async () => {
    if (token)
      $('#new-question').click(
        () => {
          let location = '/question.html';

          if (token)
            location += '?token=' + token;

          window.location = location;
        }
      );
    else
      $('#new-question').hide();

    questionsDataTable = await loadQuestions();
  }
);
