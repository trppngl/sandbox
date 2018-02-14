'use strict';

var t0; // Temp
var t1; // Temp

var audio = document.getElementById('audio');
var playAll = false;

var columnEl = document.getElementById('column');

var currentCardIndex = null;
var currentSegIndex = -1;

t0 = performance.now();

var sentenceEls = [];
var cardEls = [];
var cardSentenceIndexes = [];
var numSentences = 0;

(function () { // Temp
  
  var paragraphs = document.getElementsByClassName('paragraph');
  var el;
  
  for (var i = 0; i < paragraphs.length; i++) {
    
    el = paragraphs[i].firstElementChild; // IE9+
    
    while (el) {
      
      if (el.tagName === 'SPAN') {
        
        sentenceEls.push(el);
        numSentences++;
        
      } else {
        
        cardEls.push(el);
        cardSentenceIndexes.push(numSentences - 1);
      }
      
      el = el.nextElementSibling; // IE9+
    }
  }
})();

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
  
  if (currentCardIndex !== null) {
    
    hide(cardEls[currentCardIndex]);
    unindent(cardSentenceIndexes[currentCardIndex] + 1);
  }
  
  if (targetCardIndex !== null && targetCardIndex !== currentCardIndex) {
    
    show(cardEls[targetCardIndex]);
    indent(cardSentenceIndexes[targetCardIndex] + 1);
    currentCardIndex = targetCardIndex;
    
  } else {
    
    currentCardIndex = null;
  }
}

//

function getOffsets() { // Might not need both top and left anymore
  
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

function getIndents() { // Close and reopen current card (if any)?
  
  var offsets = getOffsets();
  
  for (var i = 0; i < numSentences; i++) {
    indents[i] = sentenceEls[i].getClientRects()[0].left - offsets.left;
  }
}

// On page load or resize

t0 = performance.now();

getIndents();

t1 = performance.now();
console.log('getIndents(): ' + (t1 - t0).toFixed(3) + 'ms');

// Event handlers

function handleClick(e) { // Very temp
  
  var elToElevate = e.target.closest('.sentence').querySelector('.highlight-group'); // Temp
  var elFromPoint;
  
  if (elToElevate) {
    elToElevate.style.zIndex = '1';
    elFromPoint = document.elementFromPoint(e.clientX, e.clientY);
    elToElevate.style.zIndex = '-1';
  }
  
  if (elFromPoint.dataset.card) {
    toggleCard(Number(elFromPoint.dataset.card));
  }
}

function handleKeydown(e) {
  switch(e.keyCode) {
    case 32:
      e.preventDefault();
      togglePlayAll();
      break;
  }
}

// Event listeners

document.addEventListener('click', handleClick); // columnEl?
document.addEventListener('keydown', handleKeydown);

//

/*t0 = performance.now();
t1 = performance.now();
console.log((t1 - t0).toFixed(3) + 'ms');*/

//

var times = [
  [356.908, 358.217],
  [358.244, 360.619],
  [360.842, 364.097],
  [364.097, 365.352],
  [366.617, 369.518],
  [369.518, 370.272],
  [370.272, 372.331],
  [372.468, 373.928],
  [374.053, 374.937],
  [374.937, 376.306],
  [376.692, 380.103],
  [381.499, 386.316],
  [387.897, 392.791],
  [392.952, 394.813],
  [394.984, 397.363],
]

//

function togglePlayAll() {
  if (audio.paused) {
    playAll = true;
    next();
  } else {
    playAll = !playAll;
  }
}

function next() { // Temp
  playSeg(currentSegIndex + 1)
}

/*function next() {
  var nextVisibleIndex = getNextVisibleIndex();
  if (nextVisibleIndex !== undefined) {
    playSeg(nextVisibleIndex);
  }
}*/

function playSeg(index) { // Temp
  currentSegIndex = index;
  audio.currentTime = times[currentSegIndex][0];
  if (audio.paused) {
    audio.play();
  }
}