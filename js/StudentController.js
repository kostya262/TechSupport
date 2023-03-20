export default class StudentController {
  constructor(addData) {
    if (addData) {
      this.data = addData
    } else {
      this.data = {
        fullname: {
          type: 'text',
          value: 'ФИО ученика'
        },
        address: {
          type: 'text',
          value: 'Адрес ученика'
        },
        numberClass: {
          type: 'text',
          value: '№ класса ученика'
        },
        olympics: {
          type: 'checkbox',
          value: 'Участвовал в олимпиадах'
        },
      }
    }

  }

  addProperty(name, value) {
    this.data[name] = {type: 'text', value}
  }

  getProperty() {
    return this.data
  }

}