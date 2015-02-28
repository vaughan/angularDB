alert('tableView.js');
var tvApp = angular.module("sb.tableView", ['sb.main','ui.grid','ui.grid.edit','ui.grid.rowEdit','ui.grid.resizeColumns','ui.grid.cellNav','ui.grid.selection']);
tvApp.controller("tableViewCtr", ['$scope', '$http', '$q', '$timeout', '$compile', 'uiGridSelectionService',
 function($scope, $http, $q, $timeout, $compile, uiGridSelectionService) {
  $scope.getSelectedRows = function() {
    alert('get selected rows: ' + JSON.stringify($scope.gridApi.selection.getSelectedRows()));
    //alert('get selected grid rows: ' + JSON.stringify($scope.gridApi.selection.getSelectedGridRows()));
   }
  $scope.columns = [];
  $scope.gridOptions = {
    columnDefs: $scope.columns
   };
  function sendSql(sql) {
    var sendSqlPromise = $http.get("/sql?get=" + sql);
    var defer = $q.defer();
    sendSqlPromise.then(
      function(payload) {
        if (payload.data.result === 'success') {
          defer.resolve();
         } else {
          alert('unwanted http response: ' + JSON.stringify(payload));
          defer.reject(payload);
         }
       },
      function(err) {
        alert('http err: ' + JSON.stringify(err));
        defer.reject(err);
       }
     );
   }
  $scope.createFormFromTable = function() {
    
   }   
  $scope.deleteRows = function() {
    var rows = $scope.gridApi.selection.getSelectedRows();
    var rowids = rows.map(function(row) {
      return row.rowid;
     })
    var sql = "delete from '" + $scope.tableName + "' where rowid in (" + rowids.join(", ") + ")";
    sendSql(sql);
    $scope.openTable($scope.tableName);
   }
  $scope.saveRow = function(row) {
    var sql;
    var fields = Object.keys(row);
    var deleteIndex = fields.indexOf('$$hashKey'); //delete array element that is not field
    fields.splice(deleteIndex, 1);

    if (row.rowid) { //sql update
      sql = "update '" + $scope.tableName + "' set ";
      //delete array elements that are not table fields to be updated: rowid and $$hashKey
      deleteIndex = fields.indexOf('rowid');
      fields.splice(deleteIndex, 1);
      
      sql += fields.map(function(field) {
        return field + "='" + row[field] + "'";
       }).join(", ");
      sql += " where rowid = " + row['rowid']; 
     } else { //sql insert
      sql = "insert into '" + $scope.tableName + "' ( ";
      sql += "'" + fields.join("', '") + "'";
      sql += ") values (";
      sql += fields.map(function(field) {
        return "'" + row[field] + "'";
       }).join(", ");
      sql += ");";
     }
    var sendSql = $http.get("/sql?get=" + sql);
    var defer = $q.defer();
    $scope.gridApi.rowEdit.setSavePromise( $scope.gridApi.grid, row, defer.promise );
    sendSql.then(
      function(payload) {
        if (payload.data.result === 'success') {
          defer.resolve();
         } else {
          alert('unwanted http response: ' + JSON.stringify(payload));
          defer.reject(payload);
         }
       },
      function(err) {
        alert('http err: ' + JSON.stringify(err));
        defer.reject(err);
       }
     );
   };
  $scope.gridOptions.onRegisterApi = function(gridApi){
    $scope.gridApi = gridApi;
    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
   };
  $scope.onKeyPress = function() {
    alert('keypress!');
   }
  $scope.openTable = function(table) {
    $http.get("/table?get=" + table)
      .success(function(response) {
        $scope.tableName = response.table;
        $scope.columns.splice(0,$scope.columns.length);
        response.fields.forEach(function(field) {
		  $scope.columns.push(field);
	     });
        $scope.gridOptions.data = response.rows;

        //add blank row for new records
        var row = {};
        response.fields.forEach(function(field) {
          row[field['name']] = null;
         });
        $scope.gridOptions.data.push(row);
       });
   };
  $scope.openTable('classes');
 }]);
