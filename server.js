var connect = require('connect');
var serveStatic = require('serve-static');
var app = connect();
app.use(serveStatic(__dirname + "/public"));

var dbFilePath = process.argv[2];
var db = require("./lib/Db");
db.load(dbFilePath);

var url = require('url');
app.use('/table', function(req, res){
  var url_parts = url.parse(req.url, true);
  console.log('url_parts: ' + url_parts);
  var query = url_parts.query;
  console.log('query: ' + query);
  var table = query['get'];
  console.log('table: ' + table);
  db.sqlite3_db.all(
    "select rowid, * from '" + table + "'", 
    function(err,rows) {
      var tableData = {
        table: table,
        rows: rows
       }
      console.log(tableData);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tableData, null, 3));
     }
   );
 });

app.use('/sql', function(req, res){
  var sql = url.parse(req.url, true).query['get'];
  console.log('sql: ' + sql);
  db.sqlite3_db.all(sql, function(err, rows) {
    if (err) {
      console.log('error: ' + err);
      console.log(' - sql: ' + sql);
     }
    console.log(rows);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows, null, 3));
   });
 });

app.use('/tables', function(req, res) {
  db.tables(function (tables) {
    console.log(tables);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tables, null, 3));
   });
 });

app.listen(8080);
console.log("listening on port 8080");
