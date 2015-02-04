angular.module("sbList", ['sqlApp'])
  .directive("sbList", ["$compile", function($compile) {
    return {
      restrict: 'AE',
      compile: function(el, atrs, transclude) {
        return function postLink(scope, element, attrs) {
          console.log('sbList post');
          var list = $(element).get(0);
          function editing(li) {
            return $(li).hasClass('editing');
           }
          function triggerIfChanged(list, li) {
            var oldValue = $(li).data('origText');
            var newValue = $(li).text();
            if ($(li).hasClass('newItem')) {
              var text = $(li).text();
              if (text == "") {
                $(li).remove();
                $(list).focus();
               } else {
                $(li)
                  .removeClass('newItem')
                  .data('origText', text);
                scope.$emit('afterInsert', text, li);
               }
             } else {
              if (oldValue != newValue) {
                scope.$emit('editItem', oldValue, newValue, li);
                $(li).data('origText',newValue);
               }          
              $(li).removeClass('editing')
             }
           }
          function initializeLi(list, li) {
            $(li)
              .attr('contentEditable','true')
              .each(function() {
                $(li).data('origText',$(li).text());
               })
              .mousedown(function() {
                if ($(li).is(':focus')) {
                  $(li).addClass('editing');
                 }
               })
              .dblclick(function(e) {
                scope.$emit('openItem', $(li).text());
               })
              .keydown(function(e) {
                if (e && e.keyCode == 40) { //down
                  $(li).next().focus();
                 } else if (e && e.keyCode == 38) { //up
                  $(li).prev().focus();
                 } else if (e && e.keyCode == 13) { //enter
                  if ($(li).hasClass('editing') || $(li).hasClass('newItem')) {
                    triggerIfChanged(list, li);
                   } else {
                    scope.$emit('openItem', $(li).text());
                   }
                  return false;
                 } else if (e && e.keyCode == 113) { //F2
                  $(li).addClass('editing');
                 } else if (e && e.keyCode == 27) { //escape
                  if ($(li).hasClass('editing') || $(li).hasClass('newItem')) {
                    triggerIfChanged(list, li);
                   }
                 } else if (e && e.keyCode == 46) { //delete
                  if (!$(li).hasClass('editing') && !$(li).hasClass('newItem')) {
                    $(li).fadeOut('fast',function() {
                      if ($(li).is($(list).find('li:last'))) {
                        if ($(li).is($(list).find('li:first'))) {
                          $(list).focus();
                         } else {
                          $(li).prev().focus();
                         }
                       } else {
                        $(li).next().focus();
                       }
                      $(li).remove();
                     });
                    scope.$emit('deleteItem', $(li).text());
                    return false;
                   }
                 } else if (!$(li).hasClass('editing') && !$(li).hasClass('newItem')) {
                  return false;
                 }
               })
              .focusout(function(e) {
                triggerIfChanged(list, li);
               });   
            return li;
           }
          function initializeList() {
            var highestTabIndex;
            if ($('[tabIndex]').length == 0) {
              highestTabIndex = 1;
             } else {
              highestTabIndex =
                $('[tabIndex]')
                .map(function() {
                  return $(this).attr('tabIndex');
                 })
                .get()
                .reduce(function(a,b) {
                  return parseInt(a) >= parseInt(b) ? parseInt(a): parseInt(b);
                 });
              }
            list.loadSourceData = function(sourceData) {
              if (sourceData !== undefined) {
                list.sourceData = sourceData;
               }        
             };
            $(document.createElement('img'))
              .attr('src','images/add_small2.png')
              .click(function() {
                var newLi = document.createElement('li');
                if ($(list).find('li').length > 0) {
                  $(newLi).insertBefore($(list).find('li:first'));
                 } else {
                  $(newLi)
                    .appendTo(list);
                 }
                initializeLi(list, newLi);
                $(newLi)
                  .addClass('newItem')
                  .focus()
                  .siblings()
                    .removeClass('editing newItem');
               })
              .prependTo(list);
            $(list)
              .attr('tabIndex',highestTabIndex + 1)
              .addClass('list')
              .focus(function(e) {
                $(this).find('li:first').focus();
               })
              .find('li').each(function() {
                initializeLi(list, this);
               });
           }

          scope.$on('onRepeatLast', function(scope, element, attrs) {
            initializeList();
           });
         }
       }
     }
   }])
  .directive("rowSource", ['$compile', '$http', function ($compile, $http) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var rowSource = attrs.rowSource;
        var rowSourceParts = rowSource.split(' in ');
        var sql = rowSource[1];
        console.log('rowSource: ' + rowSource);
        console.log('rowSource sql: ' + sql);
        var repeatPronoun = rowSourceParts[0];     
        $http.get("/sql?get=" + sql)
          .success(function(response) {
            scope.rows = response;
           });
        var newTr = element.clone();
        newTr
          .removeAttr('row-source')
          .attr('ng-repeat', repeatPronoun + ' in rows');
        element
          .css('display','none')
          .after(newTr);
        $compile(newTr)(scope);
       }
     }
   }])
  .directive('repeatLast', function() {
    return function(scope, element, attrs) {
      if (scope.$last) setTimeout(function() {
        scope.$emit('onRepeatLast', element, attrs);
       }, 1);
     };
   });
