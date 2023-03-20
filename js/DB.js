export default class DB {
  constructor(DatabaseName) {
    this.db = openDatabase(DatabaseName, "0.1", "List of students", 200000);
  }

  createTable(dbname, fields, callback, errorCallback) {
    this.db.transaction(function (t) {
      t.executeSql(`CREATE TABLE IF NOT EXISTS ${dbname} (${fields})`, [], callback, errorCallback);
    });
  }

  insertInto(dbname, columns, values, callback, errorCallback) {
    this.db.transaction(function(t) {
      t.executeSql(`INSERT INTO ${dbname} (${columns}) values(${values})`, [], callback, errorCallback);
    });
  }

  all(dbname, callback, errorCallback) {
    this.db.transaction(function(t) {
      t.executeSql(`SELECT * FROM ${dbname}`, [], callback, errorCallback)
    });
  }

  where(dbname, cond, callback, errorCallback) {
    this.db.transaction(function(t) {
      t.executeSql(`SELECT * FROM ${dbname} WHERE ${cond}`, [], callback, errorCallback)
    });
  }

  delete(dbname, id, callback, errorCallback) {
    this.db.transaction(function(t) {
      t.executeSql(`DELETE FROM ${dbname} WHERE id='${id}'`, [], callback, errorCallback)
    });
  }

 //  select(columns, dbname, callback, errorCallback) {
 //    this.db.transaction(function(t) {
 //      t.executeSql(`SELECT ${columns} FROM ${dbname}`, [], callback, errorCallback)
 //    });
 //  }
 //
 execute(sqlStatement, callback, errorCallback) {
   this.db.transaction(function(t) {
     t.executeSql(sqlStatement, [], callback, errorCallback)
   });
 }
}