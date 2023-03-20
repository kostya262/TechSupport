import { el, mount } from "https://redom.js.org/redom.es.min.js";
import DB from "./DB.js";
import StudentController from "./StudentController.js";

const db = new DB("Students");
const Student = new StudentController(JSON.parse(localStorage.getItem('props')));

db.createTable("Students", "id INTEGER PRIMARY KEY, fullname TEXT, address TEXT, numberClass TEXT, olympics TEXT DEFAULT 'Нет'");

const form = document.getElementById("form");
const removeList = document.getElementById("removeList");
const modalSuccess = document.getElementById("modal-success");
const modalSuccessText = modalSuccess.querySelector(".modal__text");
const modalSuccessClose = modalSuccess.querySelector(".modal__button");
const modalProp = document.getElementById("modalProp");

const addStudentButton = document.getElementById("addStudent");
const showStudentsButton = document.getElementById("showStudents");
const clearFormButon = document.getElementById("clearForm");
const removeStudentsButton = document.getElementById("removeStudent");
const addPropertyButton = document.getElementById("addProperty");
const nonOlympiadsButton = document.getElementById("nonOlympiads");

showFormInputs()
showRemoveList()
modalProp.addEventListener('submit', ev => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const data = Object.fromEntries(fd);

  const columnName = translit(data.nameProp).toLowerCase();

  db.execute(`ALTER TABLE Students ADD ${columnName} TEXT DEFAULT ${data.dateProp}`,
    function (t, result) {
      Student.addProperty(columnName, data.nameProp);
      localStorage.setItem('props', JSON.stringify(Student.getProperty()))
      showFormInputs();
      modalProp.style.display = 'none'
    },
    function (t, err) {
      modalProp.style.display = 'none'
    });
})

form.addEventListener('submit', ev => {
  ev.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd)

  db.insertInto("Students", Object.keys(data).join(', '), "'" + Object.values(data).join("', '") + "'",
    function (t, result) {
      showModal("Пользователь успешно добавлен");
      showRemoveList()
    },
    function (t, error) {
      showModal(error);
    })
});

showStudentsButton.addEventListener('click', ev => {
  ev.preventDefault();

  db.all("Students", function(t, result) {
    showTable(result.rows);
  });
});

nonOlympiadsButton.addEventListener('click', ev => {
  ev.preventDefault();

  db.where("Students", "olympics='Нет'", function(t, result) {
    showTable(result.rows);
  });
});

clearFormButon.addEventListener('click', () => {
  form.reset();
});

removeStudentsButton.addEventListener('click', () => {
  const selectedIndex = removeList.options.selectedIndex;
  const options = removeList.options;
  const value = options[selectedIndex].value

  if (value !== "header") {
    db.delete("Students", value, function () {
      showModal("Данные о пользователе удалены")
    })
  }
  showRemoveList()
});

addPropertyButton.addEventListener('click', () => {
  modalProp.style.display = 'flex';

});

modalSuccessClose.addEventListener('click', () => {
  modalSuccess.style.display = 'none';
});

document.addEventListener('keydown', (ev) => {
  if (ev.code === 'Escape') {
    modalSuccessClose.style.display = 'none';
    modalProp.style.display = 'none';
  }
});

function showModal(text) {
  modalSuccessText.innerHTML = text;
  modalSuccess.style.display = "flex";
}

function clearTable() {
  const table = document.getElementById("table");
  const theaders = table.querySelectorAll('.table__header th');
  const rows = table.querySelectorAll(".table__row");
  theaders.forEach(el => {
    el.remove()
  });

  rows.forEach(el => {
    el.remove();
  });
}

function createTableRow(student) {
  const table = document.getElementById("table");
  const tbody = table.querySelector('tbody');
  const ceils = []

  for(const prop of Object.keys(student)) {
    ceils.push(el('td.table__ceil', {innerHTML: student[prop]}))
  }

  const row = el('tr.table__row', ceils);

  mount(tbody, row);
}

function showTable(students) {
  clearTable();

  const table = document.getElementById("table");
  const theader = table.querySelector('.table__header');
  const props = Student.getProperty();

  mount(theader, el('th.table__id', {innerHTML: 'ID'}))

  for (const prop of Object.keys(props)) {
    mount(theader, el(`th.table__${prop}`, {innerHTML: props[prop].value}))
  }

  for (let i = 0; i < students.length; i++) {
    createTableRow(students[i]);
  }
}

function showRemoveList() {
  const options = Array.from(removeList.children).slice(1);
  options.forEach(el => {
    el.remove();
  });
  db.all("Students", function (t, result) {
    for(let i = 0; i < result.rows.length; i++) {
      mount(removeList, el(`option`, {value: result.rows[i].id,innerHTML: result.rows[i].id}));
    }
  });
}


function showFormInputs() {
  const props = JSON.parse(localStorage.getItem('props')) || Student.getProperty();
  const formInput = form.querySelectorAll('.form__input');
  const formInputs = form.querySelector('.form__inputs');

  formInput.forEach(el => {
    el.remove();
  })

  for (const prop of Object.keys(props)) {
    let input;
    if (props[prop].type === 'checkbox') {
      input = el('.form__input.mt-3',
          el('input.form-check-input', {id: prop, name: prop, type: props[prop].type, value: 'Да'}),
          el('label.form-check-label.ms-2', {'for': prop, innerHTML: props[prop].value}),
      )
    } else {
      input = el('.form__input.mt-3',
          el('label.form-label', {'for': prop, innerHTML: props[prop].value}),
          el('input.form-control', {id: prop, name: prop, type: props[prop].type})
      )
    }

    mount(formInputs, input)
  }
}

function translit(word){
  var answer = '';
  var converter = {
    'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
    'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
    'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
    'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
    'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
    'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',
    'э': 'e',    'ю': 'yu',   'я': 'ya',

    'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
    'Е': 'E',    'Ё': 'E',    'Ж': 'Zh',   'З': 'Z',    'И': 'I',
    'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
    'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
    'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'Ch',
    'Ш': 'Sh',   'Щ': 'Sch',  'Ь': '',     'Ы': 'Y',    'Ъ': '',
    'Э': 'E',    'Ю': 'Yu',   'Я': 'Ya',   ' ': '_',
  };

  for (var i = 0; i < word.length; ++i ) {
    if (converter[word[i]] == undefined){
      answer += word[i];
    } else {
      answer += converter[word[i]];
    }
  }

  return answer;
}
