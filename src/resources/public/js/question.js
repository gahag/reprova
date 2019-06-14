function textboxEmpty(tbox) {
  let val = tbox.val();
  return val == '' || val == tbox.prop('name');
}


function saveRecord() {
  let semester = $('#semesters option:selected').text();

  function getVal() {
    return $(this).val();
  }

  let classes = $("#semester input[type=text]")
      .map(getVal)
      .get();

  let recs = $("#semester input[type=number]")
      .map(getVal)
      .get();

  let repeated = false;

  let record = classes.reduce(
    (obj, c, i) => {
      if (c in obj)
        repeated = true;

      return ({
        ...obj,
        [c]: Number(recs[i])
      });
    },
    {}
  );

  if (repeated) {
    alert('There are two classes with the same name!');
    return;
  }

  question.record[semester] = record;
}


function selectRecord(record) {
  let parent = $('#semester');

  function addRow(cls, value) {
    let row = document.createElement('div');

    let clsInput = document.createElement('input');
    clsInput.type = 'text';
    clsInput.name = 'Turma';
    clsInput.value = cls;
    clsInput.className = 'short';
    clsInput.onfocus = function() {
      if (this.value == this.name)
        this.value = '';
    };
    clsInput.onblur = function() {
      if (this.value == '')
        this.value = this.name;
    };
    row.appendChild(clsInput);

    let valInput = document.createElement('input');
    valInput.type = 'number';
    valInput.min = 0;
    valInput.max = 100;
    valInput.value = value;
    valInput.className = 'short';
    row.appendChild(valInput);

    let remove = document.createElement('input');
    remove.type = 'button';
    remove.value = '-';
    remove.className = 'toolbutton';
    remove.onclick = () => row.parentNode.removeChild(row);
    row.appendChild(remove);

    parent.append(row);
  }

  parent.empty();

  for (let [ cls, val ] of Object.entries(record))
    addRow(cls, val);

  let buttons = document.createElement('div');
  buttons.className = 'buttons';
  parent.append(buttons);

  let add = document.createElement('input');
  add.type = 'button';
  add.value = 'Add';
  add.onclick = () => {
    buttons.parentNode.removeChild(buttons);
    addRow('Turma', '0');
    parent.append(buttons);
  };
  buttons.appendChild(add);

  let save = document.createElement('input');
  save.type = 'button';
  save.value = 'Save';
  save.onclick = saveRecord;
  buttons.appendChild(save);
}

function loadRecord(record) {
  let select = $('#semesters');
  select.empty();

  for (let [ semester, rec ] of Object.entries(record)) {
    let option = document.createElement('option');
    option.appendChild(document.createTextNode(semester));

    select.append(option);

    select.change(
      () => {
        if (option.selected)
          selectRecord(rec);
      }
    );
  }
}


async function loadfile(inputFile) {
  const filereader = new FileReader();

  return new Promise(
    (resolve, reject) => {
      filereader.onerror = () => {
        filereader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      filereader.onload = () => resolve(filereader.result);

      filereader.readAsDataURL(inputFile);
    }
  );
};


async function load() {
  const request = await fetch(
    '/api/questions?token=' + token + '&id=' + id
  );
  const question = await request.json();

  $('#description').val(question.description);
  $('#theme').val(question.theme);
  loadRecord(question.record);
  $('#pvt').prop('checked', question.pvt);

  return question;
}


async function save() {
  const description = $('#description');
  const theme = $('#theme');
  const pvt = $('#pvt').prop('checked');

  if (textboxEmpty(description)) {
    alert('Please fill in the description!');
    description.focus();
    return;
  }

  if (textboxEmpty(theme)) {
    alert('Please fill in the theme!');
    theme.focus();
    return;
  }

  const file = $('#statement').prop('files')[0];

  if (!file && !question.statement) {
    alert('Please choose a file!');
    return;
  }

  const statement = file ? file.name + '/' + await loadfile(file)
                         : question.statement;

  question = {
    'theme': theme.val(),
    'description': description.val(),
    'statement': statement,
    'record': question.record,
    'pvt': pvt,
  };

  if (id)
    question['id'] = id;

  const request = await fetch(
    '/api/questions?token=' + token,
    {
      method: 'post',
      body: JSON.stringify(question)
    }
  );

  if (request.ok)
    window.location = token ? '/?token=' + token
                            : '/';
  else
    alert('Failed to upload question!');
}


const url = new URL(window.location.href);
const token = url.searchParams.get("token");
const id = url.searchParams.get("id");

let question = {
  record: {}
};

$(document).ready(
  async() => {
    const inputs = $('textarea,input[type=text]');

    inputs.focus(
      function() {
        if ($(this).val() == $(this).prop('name'))
          $(this).val('');
      }
    );

    inputs.blur(
      function() {
        if ($(this).val() == '')
          $(this).val($(this).prop('name'));
      }
    );


    $('#add-semester').click(
      () => {
        let year = $('#year').val();

        if (year < 0 || year > 3000) {
          alert('Invalid year!');
          return;
        }

        let ref = $('#ref').val();

        if (ref < 1 || ref > 2) {
          alert('Invalid semester!');
          return;
        }

        let semester = year + '/' + ref;

        if (!(semester in question.record))
          question.record[semester] = {};

        loadRecord(question.record);
      }
    );


    $('#remove-semester').click(
      () => {
        let selected = $('#semesters option:selected');
        let semester = selected.text();

        if (!semester || !confirm('Remove semester ' + semester + ' ?'))
          return;

        delete question.record[semester];

        selected.remove();
        $('#semester').empty();
      }
    );


    $('#save').click(save);

    if (id)
      question = await load(id);
  }
);
