define([
  'lodash',
   'jquery',
   'tpl!nmcGapMatchInteraction/creator/tpl/br',
  ], function (
    _, 
    $,
    brTpl,
    ) {
  'use strict';

  var methods = {
    replaceBr: function replaceBr(string) {
      const rx = /<[ \t\r\n]*[Bb][Rr][ \t\r\n]*\/?[ \t\r\n]*>/g;
      return string.replace(rx, brTpl());
    },
    replaceBrInElem: function replaceBrInElem($elem) {
      $elem.find('br').replaceWith(brTpl());
    },
    fixTable: function fixTable(container) {
      var dom = $(container)[0];
      var rows = dom.querySelectorAll('tr');
      rows.forEach(row => {
        var children = Array.prototype.slice.call(row.childNodes);
        var firstVal = row.firstElementChild.getAttribute('rowspan');
        var areSame;
        if (!firstVal) {
          return;
        }
        areSame = children.every(function (td) {
          var attr = td.getAttribute('rowspan');
          if (!attr) {
            return false;
          }
          return attr === firstVal;
        });
        if (!areSame) {
          return;
        }
        fixTr(row);
      });
      var colgroups = dom.querySelectorAll('colgroup');
      colgroups.forEach(function (elem) {
        elem.remove();
      })
      return dom.innerHTML;
    },
    fixTr: function fixTr(trElem) {
      trElem.childNodes.forEach(function (td) {
        td.removeAttribute('rowspan');
      });
    },
  }



  return methods;

});