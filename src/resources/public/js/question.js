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
    'http://localhost:8080/api/questions?token=' + token + '&id=' + id
  );
  const question = await request.json();

  $('#description').val(question.description);
  $('#theme').val(question.theme);
  // TODO record
  $('#pvt').prop('checked', question.pvt);

  return question;
}


async function save() {
  const description = $('#description');
  const theme = $('#theme');
  // TODO record
  const pvt = $('#pvt').prop('checked');

  if (description.val() == description.prop('name')) {
    alert('Please fill in the description!');
    description.focus();
    return;
  }

  if (theme.val() == theme.prop('name')) {
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
    'record': { }, // TODO
    'pvt': pvt,
  };

  if (id)
    question['id'] = id;

  const request = await fetch(
    'http://localhost:8080/api/questions?token=' + token,
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

let question = {};

$(document).ready(
  async() => {
    const inputs = $('textarea,input[type=text]');

    inputs.focus(
      function() {
        if ($(this).val() == $(this).attr('name'))
          $(this).val('');
      }
    );

    inputs.blur(
      function() {
        if ($(this).val() == '')
          $(this).val($(this).attr('name'));
      }
    );


    $('#save').click(save);

    if (id)
      question = await load(id);
  }
);
