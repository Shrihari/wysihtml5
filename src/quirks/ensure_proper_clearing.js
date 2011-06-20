/**
 * IE and Opera leave an empty paragraph in the contentEditable element after clearing it
 *
 * @author Christopher Blum <christopher.blum@xing.com>
 * @param {Object} contentEditableElement The contentEditable element to observe for clearing events
 * @exaple
 *    wysihtml5.quirks.ensureProperClearing(myContentEditableElement);
 */
wysihtml5.quirks.ensureProperClearing = (function() {
  var clearIfNecessary = function(event) {
    var element = this;
    setTimeout(function() {
      var innerHTML = element.innerHTML.toLowerCase();
      if (innerHTML == "<p>&nbsp;</p>" ||
          innerHTML == "<p>&nbsp;</p><p>&nbsp;</p>") {
        element.innerHTML = "";
      }
    }, 0);
  };
  
  return function(contentEditableElement) {
    wysihtml5.utils.observe(contentEditableElement, ["cut", "keydown"], clearIfNecessary);
  };
})();



/**
 * In Opera when the caret is in the first and only item of a list (<ul><li>|</li></ul>) and the list is the first child of the contentEditable element, it's impossible to delete the list by hitting backspace
 *
 * @author Christopher Blum <christopher.blum@xing.com>
 * @param {Object} contentEditableElement The contentEditable element to observe for clearing events
 * @exaple
 *    wysihtml5.quirks.ensureProperClearing(myContentEditableElement);
 */
wysihtml5.quirks.ensureProperClearingOfLists = (function() {
  var ELEMENTS_THAT_CONTAIN_LI = ["OL", "UL", "MENU"];
  
  var clearIfNecessary = function(element, contentEditableElement) {
    if (!contentEditableElement.firstChild || ELEMENTS_THAT_CONTAIN_LI.indexOf(contentEditableElement.firstChild.nodeName) == -1) {
      return;
    }
    
    var list = wysihtml5.utils.getParentElement(element, { nodeName: ELEMENTS_THAT_CONTAIN_LI });
    if (!list) {
      return;
    }
    
    var listIsFirstChildOfContentEditable = list == contentEditableElement.firstChild;
    if (!listIsFirstChildOfContentEditable) {
      return;
    }
    
    var hasOnlyOneListItem = list.childNodes.length <= 1;
    if (!hasOnlyOneListItem) {
      return;
    }
    
    var onlyListItemIsEmpty = list.firstChild ? list.firstChild.innerHTML === "" : true;
    if (!onlyListItemIsEmpty) {
      return;
    }
    
    list.parentNode.removeChild(list);
  };
  
  return function(contentEditableElement) {
    wysihtml5.utils.observe(contentEditableElement, "keydown", function(event) {
      if (event.keyCode != 8) { // 8 = backspace
        return;
      }
      
      var element = wysihtml5.utils.caret.getSelectedNode(contentEditableElement.ownerDocument);
      clearIfNecessary(element, contentEditableElement);
    });
  };
})();