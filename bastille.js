'use strict';

var t0; // Temp
var t1; // Temp

var columnEl = document.getElementById('column');

var currentCardIndex;

t0 = performance.now();

var sentenceEls = [];
/*var firstSegEls = [];*/
var cardEls = [];
var prevSentenceIndexes = [];
var numSentences = 0;

(function () {
  
  var paragraphs = document.getElementsByClassName('paragraph');
  var el;
  
  for (var i = 0; i < paragraphs.length; i++) {
    
    el = paragraphs[i].firstElementChild; // IE9+
    
    while (el) {
      
      if (el.tagName === 'SPAN') {
        
        sentenceEls.push(el);
        /*firstSegEls.push(el.firstElementChild); // IE9+*/
        numSentences++;
        
      } else {
        
        cardEls.push(el);
        prevSentenceIndexes.push(numSentences - 1);
      }
      
      el = el.nextElementSibling; // IE9+
    }
  }
})();

/*(function () {
  
  var paragraphs = document.getElementsByClassName('paragraph');
  var theseChildren;
  var el;
  
  for (var i = 0; i < paragraphs.length; i++) {
    
    theseChildren = paragraphs[i].children; // IE9+
    
    for (var j = 0; j < theseChildren.length; j++) {
      
      el = theseChildren[j];
      
      if (el.tagName === 'SPAN') {
        
        sentenceEls.push(el);
        firstSegEls.push(el.firstElementChild); // IE9+
        numSentences++;
        
      } else {
        
        cardEls.push(el);
        prevSentenceIndexes.push(numSentences - 1);
      }
    }
  }
})();*/

t1 = performance.now();
console.log('Populate arrays: ' + (t1 - t0).toFixed(3) + 'ms');

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

//

function getOffsets() { // Separate functions for top and left?
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  
  var columnRect = columnEl.getBoundingClientRect();
  
  var top = columnRect.top - scrollTop;
  var left = columnRect.left - scrollLeft;
  
  return {
    top: top,
    left: left
  }
}

//

/*function getIndentsResizeBackdrops() { // Combined two functions
  
  var offsets = getOffsets();
  var rects = [];
  
  for (var i = 0; i < numSentences; i++) {
    
    indents[i] = sentenceEls[i].getClientRects()[0].left - offsets.left;
    
    rects[i] = sentenceEls[i].getBoundingClientRect();
  }
  
  for (i = 0; i < numSentences; i++) {
    
    backdropEls[i].style.top = rects[i].top - offsets.top + 'px';
    backdropEls[i].style.height = rects[i].height + 'px';
  }
}*/

function getIndents() { // Close and reopen current card (if any)?
  
  var offsets = getOffsets();
  
  for (var i = 0; i < numSentences; i++) {
    indents[i] = sentenceEls[i].getClientRects()[0].left - offsets.left;
  }
}

/*function resizeBackdrops() {
  
  var offsets = getOffsets();
  
  var rects = [];
  
  var top;
  var height;
  
  for (var i = 0; i < numSentences; i++) {
    rects[i] = sentenceEls[i].getBoundingClientRect();
  }
  
  for (i = 0; i < numSentences; i++) {
    
    top = rects[i].top - offsets.top;
    height = rects[i].height;
    
    backdropEls[i].style.top = top + 'px';
    backdropEls[i].style.height = height + 'px';
  }
}*/

// On page load or resize

t0 = performance.now();

getIndents();

t1 = performance.now();
console.log('getIndents(): ' + (t1 - t0).toFixed(3) + 'ms');

// Event handlers

function handleClick(e) { // Temp
  
  var xPos = e.clientX;
  var yPos = e.clientY;
  
  var highlightGroup = e.target.firstElementChild // Temp
  var elFromPoint;
  
  highlightGroup.style.zIndex = '1';
  elFromPoint = document.elementFromPoint(xPos, yPos);
  highlightGroup.style.zIndex = '-1';
  
  console.log(elFromPoint);
}

// Event listeners

columnEl.addEventListener('click', handleClick, true);

/*t0 = performance.now();
t1 = performance.now();
console.log((t1 - t0).toFixed(3) + 'ms');*/
