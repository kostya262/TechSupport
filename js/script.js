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

  db.execute(`ALTER TABLE Students ADD ${data.nameProp} TEXT DEFAULT ${data.dateProp}`,
    function (t, result) {
      Student.addProperty(data.nameProp, data.nameProp);
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
    const input = el('.form__input',
      el('label', {'for': prop, innerHTML: props[prop].value}),
      el('input', {id: prop, name: prop, type: props[prop].type, value: props[prop].type === 'checkbox' ? 'Да' : ''})
    )
    mount(formInputs, input)
  }
}
