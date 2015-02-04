angular.module("sqlApp", [])
  .directive('sqlRepeat', ['$compile', '$http', function ($compile, $http) {
    return {
      restrict: 'A',
      link: {
        pre: function preLink(scope, element, attrs) {
          console.log('sqlRepeat pre');
          var sqlRepeat = attrs.sqlRepeat;
          var sqlRepeatParts = sqlRepeat.split(' in ');
          console.log('sqlRepeatParts: ' + JSON.stringify(sqlRepeatParts));
          var sql = sqlRepeatParts[1];
          var repeatPronoun = sqlRepeatParts[0];     
          $http.get("/sql?get=" + sql)
            .success(function(response) {
              scope.rows = response;
              console.log('scope.rows: ' + JSON.stringify(scope.rows));
             });
          var newTr = element.clone();
          newTr
            .removeAttr('sql-repeat')
            .attr('ng-repeat', repeatPronoun + ' in rows');
          element
            .css('display','none')
            .after(newTr);
          $compile(newTr)(scope);
         },
        post: function() {}
       }
     }
   }]);
