'use strict';

var columnEl = document.getElementById('column');

var currentCardIndex;

var t0 = performance.now();

var sentenceEls = [];
var firstSegEls = [];
var cardEls = [];
var prevSentenceIndexes = [];
var numSentences = 0;

(function () { // Will need to modify to handle multiple grafs
  
  var el = document.getElementById('sentence0');
  
  while (el) {
    
    if (el.tagName === 'SPAN') {
      
      sentenceEls.push(el);
      firstSegEls.push(el.firstElementChild); // IE9+
      numSentences++;
      
    } else {
      
      cardEls.push(el);
      prevSentenceIndexes.push(numSentences - 1);
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
  return columnEl.getBoundingClientRect().left;
}

//

function getIndents() {
  
  var columnLeft = getColumnLeft();
  
  for (var i = 0; i < numSentences; i++) {
    indents[i] = firstSegEls[i].getClientRects()[0].left - columnLeft;
  }
}

//

function indent(sentenceIndex) {
  
  if (sentenceIndex < numSentences) {
    sentenceEls[sentenceIndex].style.marginLeft = indents[sentenceIndex] + 'px';
  }
}

function unindent(sentenceIndex) {
  
  if (sentenceIndex < numSentences) {
    sentenceEls[sentenceIndex].style.marginLeft = '';
  }
}

//

function toggleCard(targetCardIndex) {
  
  if (currentCardIndex !== undefined) {
    
    hide(cardEls[currentCardIndex]);
    unindent(prevSentenceIndexes[currentCardIndex] + 1);
  }
  
  if (targetCardIndex !== undefined && targetCardIndex !== currentCardIndex) {
    
    show(cardEls[targetCardIndex]);
    indent(prevSentenceIndexes[targetCardIndex] + 1);
    currentCardIndex = targetCardIndex;
    
  } else {
    
    currentCardIndex = undefined;
  }
}

// On page load or resize

getIndents();

/*
var t0 = performance.now();
var t1 = performance.now();
console.log((t1 - t0).toFixed(3) + "ms");
*/
