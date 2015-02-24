function alert(text) {
  $('#display').text($('#display').text() + '|' + text);
 }
sb = angular.module("sb.main", ['sbList','oc.lazyLoad'])
sb.config(['$compileProvider',function($compileProvider) {
    sb.compileProvider=$compileProvider;
   }])
  .controller("mainCtr", ['$scope', '$http', '$ocLazyLoad', function($scope, $http, $ocLazyLoad) {
    $scope.content = {};
    $scope.components = {
      tableView: {
        url: '_tableView.html',
        js: ['js/tableView.js', 'components/angular-ui-grid/ui-grid.min.js'],
        module: 'sb.tableView' 
       }
     }
    $scope.loadContents = function(componentName) {
      if (!componentName in $scope.components) {
        alert('componentName not in $scope.components');
       } else {
        var component = $scope.components[componentName];
        $scope.content.url = component.url;
        /*$ocLazyLoad.load({
	  name: 'sb.tableView',
	  files: ['js/tableView.js']
         });*/
        $ocLazyLoad.load({
	  name: component.module,
	  files: component.js
         });
        $scope.apply();
       }
     }
    $scope.$on('openItem', function(e, item) {
      //$scope.openTable(item);
      $scope.viewTable(item);
      //alert('open table ' + item);
     });
    $scope.getSelectedRows = function() {
      alert('get selected rows: ' + JSON.stringify($scope.gridApi.selection.getSelectedRows()));
     }
    $scope.getTables = function() {
      $http.get("/tables")
        .success(function(response) {
          $scope.tables = response;
         });    
     };
    $scope.getTables();
    $scope.viewTable = function(table) {
      $http.get("/_tableView.html")
        .success(function(response) {
          $scope.tables = response;
         });        
     }
   }])
  .directive('script', function($document, $compile) { //permit lazyloading of script tags in partials from ng-include
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr) {
        //new Function(elem.text())();
        $document.append(elem);
        $compile(elem)(scope);
       }
     };
   }); 
