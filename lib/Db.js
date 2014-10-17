//**private properties
var sqlite3 = require('sqlite3').verbose(),
    dbFilePath,
    sqlite3_db;
    //regxComments = /(?:\/\*([\s\S]*?)\*\/)|(?:--\s*(.*)\n)/g;
var regxDashComments = /--\s*(.*)\n/;
var regxCcomments = /\/\*\s*((?:\S[\s\S]*?\S)|\w)\s*\*\//; 
var regxComments = RegExp('(?:' + regxDashComments.source + ')|(?:' + regxCcomments.source + ')', 'g');

//**public properties
exports.sqlite3_db = sqlite3_db;

//**public methods 
//load db file (serves as constructor)
exports.load = function(dbFileP) {
  dbFilePath = dbFileP;
  exports.sqlite3_db = new sqlite3.Database(dbFilePath);
  return this;
 }

//tables(): returns array of tables in db
exports.tables = function(callback) {
  sqlite3_db = new sqlite3.Database(dbFilePath);
  var tables = [];
  sqlite3_db.each(
    "SELECT name FROM main.sqlite_master WHERE type='table'",
    function(err,row) { tables.push(row.name); },
    function()        { callback(tables);      }
   );
 }

/*
exports.fields = function(table, callback) {
  sqlite3_db = new sqlite3.Database(dbFilePath);
  var tables = [];
  sqlite3_db.each(
    "SELECT name FROM main.sqlite_master WHERE type='table'",
    function(err,row) { tables.push(row.name); },
    function()        { callback(tables);      }
   );
 }*/

exports.tableDescription = function(table, callback) {
  sqlite3_db = new sqlite3.Database(dbFilePath);  
  sqlite3_db.get(
    "SELECT sql FROM main.sqlite_master WHERE name='" + table + "';",
    function(err, row) {
      var description = '';
      var preParentheses = row.sql.match(/^([\s\S]*)\(/);
      if (preParentheses != null) {
        preParentheses = preParentheses[1];
        var comments = [], commentsMatch;
        regxComments.lastIndex = 0;
        while ((commentsMatch = regxComments.exec(preParentheses)) != null) {
          comments.push(commentsMatch[1] == null ? commentsMatch[2] : commentsMatch[1]);
         }
        description = comments.join('\n');
       }
      callback(err, description);
     }
   );
 }

exports.tableFields = function(table, callback) {
  sqlite3_db = new sqlite3.Database(dbFilePath);
  var fields = [];
  var results = [];
  var schema;
  sqlite3_db.get(
    "SELECT sql FROM main.sqlite_master WHERE name='" + table + "';",
    function(err, row) {
      var fieldParenthesis = row.sql.match(/\(\s*([\s\S]*)\s*\)/m)[1]; //extract contents of parentheses
      var fieldStrings = fieldParenthesis.split(",");
      var fieldAttributes = [],
          description = '',
          fieldString = '',
          commentsMatch,
          comments;
      for (var i = 0; i < fieldStrings.length; i++) {
        fieldString = fieldStrings[i];

        //get comments from previous field after comma
        comments = [];
        var regxPrevComments = RegExp('^\\s*(?:' + regxComments.source + ')');
        while ((commentsMatch = fieldString.match(regxPrevComments)) != null) {
          comments.push(commentsMatch[1] == null ? commentsMatch[2] : commentsMatch[1]);
          fieldString = fieldString.replace(regxPrevComments,'');
         }

        description = comments.join(' - ');
        if (description.length > 0) {
          if (fields[fields.length-1].description == null) {
            fields[fields.length-1].description = description;
           } else {
            fields[fields.length-1].description += description;
           }
         }

        //get comments
        comments = [];
        while ((commentsMatch = regxComments.exec(fieldString)) != null) {
          comments.push(commentsMatch[1] == null ? commentsMatch[2] : commentsMatch[1]);
         }
        description = comments.join(' - ');
        fieldString = fieldString.replace(regxComments, ''); //erase comment

        if (!(fieldAttributes = fieldString.match(/\s*"(\S+)"\s*(\S*)\s*(.*)/))) {  //double quotes
          if (!(fieldAttributes = fieldString.match(/\s*'(\S+)'\s*(\S*)\s*(.*)/))) { //single quotes
            fieldAttributes = fieldString.match(/\s*(\S+)\s*(\S*)\s*(.*)/);   //no quotes
           }
         }
        fields.push({
          'name': fieldAttributes[1],
          'type': fieldAttributes[2],
          'constraints': fieldAttributes[3],
          'description': description
         });
       }
      callback(err, fields);
    }
   );
 };
