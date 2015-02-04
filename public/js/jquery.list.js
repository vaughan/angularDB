(function ($) {
  //private methods
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
        $(list).trigger('afterInsert',[text, li]);
       }
     } else {
      if (oldValue != newValue) {
        $(list).trigger('editItem', [oldValue, newValue, li]);
        $(li).data('origText',newValue);
       }          
      $(li).removeClass('editing')
     }
   }
  function initializeLi(list, li) {
    $(li)
      .attr('contentEditable','true')
      .each(function() {
        $(this).data('origText',$(this).text());
       })
      .mousedown(function() {
        if ($(this).is(':focus')) {
          $(this).addClass('editing');
         }
       })
      .dblclick(function(e) {
        $(list).trigger('openItem', [$(this).text()]);
       })
      .keydown(function(e) {
        if (e && e.keyCode == 40) { //down
          $(this).next().focus();
         } else if (e && e.keyCode == 38) { //up
          $(this).prev().focus();
         } else if (e && e.keyCode == 13) { //enter
          if ($(this).hasClass('editing') || $(this).hasClass('newItem')) {
            triggerIfChanged(list, this);
           } else {
            $(list).trigger('openItem', [$(this).text()]);
           }
          return false;
         } else if (e && e.keyCode == 113) { //F2
          $(this).addClass('editing');
         } else if (e && e.keyCode == 27) { //escape
          if ($(this).hasClass('editing') || $(this).hasClass('newItem')) {
            triggerIfChanged(list, this);
           }
         } else if (e && e.keyCode == 46) { //delete
          if (!$(this).hasClass('editing') && !$(this).hasClass('newItem')) {
            $(this).fadeOut('fast',function() {
              if ($(this).is($(list).find('li:last'))) {
                if ($(this).is($(list).find('li:first'))) {
                  $(list).focus();
                 } else {
                  $(this).prev().focus();
                 }
               } else {
                $(this).next().focus();
               }
              $(this).remove();
             });
            $(list).trigger('deleteItem', [$(this).text()]);
            return false;
           }
         } else if (!$(this).hasClass('editing') && !$(this).hasClass('newItem')) {
          return false;
         }
       })
      .focusout(function(e) {
        triggerIfChanged(list, this);
       });   
    return li;
   }

  $.fn.list = function() {
    return $(this).each(function() {
      var list = this;
      list.loadSourceData = function(sourceData) {
        if (sourceData !== undefined) {
          list.sourceData = sourceData;
         }        
       }
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
        .addClass('list')
        .focus(function(e) {
          $(this).find('li:first').focus();
         })
        .find('li').each(function() {
          initializeLi(list, this);
         })
     });
   };
 })(jQuery);
