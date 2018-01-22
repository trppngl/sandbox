'use strict';

var column = document.getElementById('column');

var t0 = performance.now();

var sentences = [];
var firstSegs = [];
var notecards = [];
var notecardSentences = [];
var numSentences = 0;

(function () { // Will need to modify to handle multiple grafs
  
  var el = document.getElementById('sentence0');
  
  while (el) {
    
    if (el.tagName === 'SPAN') {
      
      sentences.push(el);
      firstSegs.push(el.firstElementChild); // IE9+
      numSentences++;
      
    } else {
      
      notecards.push(el);
      notecardSentences.push(numSentences - 1);
    }
    
    el = el.nextElementSibling; // IE9+
  }
})();

var t1 = performance.now();
console.log((t1 - t0).toFixed(3) + "ms");

var indents = new Array(numSentences);

//

function show(el) {
  if (el) {
    el.classList.remove('hide');
  }
}

function hide(el) {
  if (el) {
    el.classList.add('hide');
  }
}

function getColumnLeft() {
  return column.getBoundingClientRect().left;
}

//

function getIndents() {
  
  var columnLeft = getColumnLeft();
  
  for (var i = 0; i < numSentences; i++) {
    indents[i] = firstSegs[i].getClientRects()[0].left - columnLeft;
  }
}

getIndents();

/*
var t0 = performance.now();
var t1 = performance.now();
console.log((t1 - t0).toFixed(3) + "ms");
*/
