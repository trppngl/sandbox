'use strict';

var t0; // Temp
var t1; // Temp

var audio = document.getElementById('audio'); // audioEl?
var playAll = false; // Rename?

var columnEl = document.getElementById('column');

var currentCardIndex = null;
var currentSegIndex = -1;

// Maybe temp

var slideboxEls = document.getElementsByClassName('slidebox');

var sentenceEls = document.getElementsByClassName('sentence');

var numSentences = sentenceEls.length;

var cardEls = document.getElementsByClassName('card');

// Toggle cards

function indent(sentenceIndex) {
  
  if (isValidSentenceIndex(sentenceIndex)) {
    sentenceEls[sentenceIndex].style.marginLeft = indentsBySentence[sentenceIndex] + 'px';
  }
}

function unindent(sentenceIndex) {
  
  if (isValidSentenceIndex(sentenceIndex)) {
    sentenceEls[sentenceIndex].style.marginLeft = '';
  }
}

function toggleCard(targetCardIndex) {
  
  if (currentCardIndex !== null) {
    
    hide(cardEls[currentCardIndex]);
    unindent(nextSentencesByCard[currentCardIndex]);
  }
  
  if (targetCardIndex !== null && targetCardIndex !== currentCardIndex) {
    
    show(cardEls[targetCardIndex]);
    indent(nextSentencesByCard[targetCardIndex]);
    currentCardIndex = targetCardIndex;
    
  } else {
    
    currentCardIndex = null;
  }
}

// Rethink getIndents() and getOffsets() (no array of just textSegs)

/*function getOffsets() { // Might not need both top and left anymore
  
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

function getIndents() { // Close and reopen current card (if any)?
  
  var offsets = getOffsets();
  
  for (var i = 0; i < numTextSentences; i++) {
    indentsBySentence[i] = textSentenceEls[i].getClientRects()[0].left - offsets.left;
  }
}*/

// On page load or resize

/*getIndents();*/

// Helper functions

function show(el) {
  if (el) { // Check if element?
    el.classList.remove('hide');
  }
}

function hide(el) {
  if (el) { // Check if element?
    el.classList.add('hide');
  }
}

function getFirstSegInSentence(sentenceIndex) {
  return childSegsBySentence[sentenceIndex][0];
}

function getLastSegInSentence(sentenceIndex) {
  var numSegsInSentence = childSegsBySentence[sentenceIndex].length - 1;
  return childSegsBySentence[sentenceIndex][numSegsInSentence];
}

function getPrevSiblingSeg(segIndex) {
  if (parentSentencesBySeg[segIndex - 1] === parentSentencesBySeg[segIndex]) {
    return segIndex - 1;
  }
}

function getNextSiblingSeg(segIndex) {
  if (parentSentencesBySeg[segIndex + 1] === parentSentencesBySeg[segIndex]) {
    return segIndex + 1;
  }
}

function isVisSentence(sentenceIndex) {
  var parentCardIndex = parentCardsBySentence[sentenceIndex];
  return (parentCardIndex === null || parentCardIndex === currentCardIndex);
}

function isValidSentenceIndex(sentenceIndex) {
  return Boolean(sentenceEls[sentenceIndex]); // Temp
}

function getPrevVisSentence(sentenceIndex) {
  if (isValidSentenceIndex(sentenceIndex)) {
    for (var i = sentenceIndex - 1; i >= 0; i--) {
      if (isVisSentence(i)) {
        return i;
      }
    }
  }
}

function getNextVisSentence(sentenceIndex) {
  if (isValidSentenceIndex(sentenceIndex)) {
    for (var i = sentenceIndex + 1; i < numSentences; i++) {
      if (isVisSentence(i)) {
        return i;
      }
    }
  }
}

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

// Slide highlight

/*function makeHighlightBoxes(lineRange) {
  
  var box;
  var top;
  var left;
  var width;
  var thisLineRect;
  
  for (var i = lineRange.end.line; i >= lineRange.start.line; i--) {
    
    thisLineRect = visLineRects[i];
    
    // top = thisLineRect.top;
    top = thisLineRect.top;
    left = thisLineRect.left;
    width = thisLineRect.width;
    
    if (i === lineRange.end.line) {
      width = lineRange.end.offset;
    }
    
    if (i === lineRange.start.line) {
      left += lineRange.start.offset;
      width -= lineRange.start.offset;
    }
    
    box = document.createElement('div');
    box.style.top = top + 'px';
    box.style.left = left + 'px';
    box.style.width = width + 'px';
    box.classList.add('highlight-box'); // Change?
    fragment.appendChild(box); // Boxes appended in reverse; could push them to array and unreverse before appending
  }
  
  highlightPane.innerHTML = '';
  highlightPane.appendChild(fragment);
}*/

function resizeSlidebox(index, left, width) {
  
  slideboxEls[index].style = 'left: ' + left + 'px; width: ' + width + 'px;';
}

function resetSlidebox(index) {
  
  var left = slideRects[index].left;
  
  resizeSlidebox(index, left, 0);
}

function resizeSlideboxes(startBoxIndex, startOffset, endBoxIndex, endOffset) {
  
  var left;
  var width;
  
  for (var i = startBoxIndex; i <= endBoxIndex; i++) { // Was reversed (bottom-up) in bastille but can't remember why
    
    left = slideRects[i].left;
    width = slideRects[i].width;
    
    if (i === endBoxIndex) {
      width = endOffset;
    }
    
    if (i === startBoxIndex) {
      left += startOffset;
      width -= startOffset;
    }
    
    slideboxEls[i].style = 'left: ' + left + 'px; width: ' + width + 'px;';
  } 
}

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

// Arrays temporarily populated manually

var times = [ // Prob incomplete
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

var slideRects = [
  {top: 0, left: 0, width: 470},
  {top: 44, left: 0, width: 463},
  {top: 88, left: 0, width: 148},
  {top: 0, left: 0, width: 330},
  {top: 44, left: -148, width: 476},
  {top: 88, left: -148, width: 430},
  {top: 132, left: -148, width: 269},
  {top: 0, left: 0, width: 417},
  {top: 33, left: 0, width: 416},
  {top: 66, left: 0, width: 160},
  {top: 0, left: 0, width: 425},
  {top: 33, left: 0, width: 424},
  {top: 66, left: 0, width: 384},
  {top: 0, left: 0, width: 406},
  {top: 33, left: 0, width: 399},
  {top: 66, left: 0, width: 438},
  {top: 99, left: 0, width: 314},
  {top: 0, left: 0, width: 100},
  {top: 44, left: -269, width: 460},
  {top: 88, left: -269, width: 129},
  {top: 0, left: 0, width: 336},
  {top: 44, left: -129, width: 431},
  {top: 88, left: -129, width: 452},
  {top: 132, left: -129, width: 81},
  {top: 0, left: 0, width: 424},
  {top: 33, left: 0, width: 136},
  {top: 0, left: 0, width: 207},
  {top: 0, left: 0, width: 50},
  {top: 33, left: -365, width: 436},
  {top: 66, left: -365, width: 324},
]

var childSegsBySentence = [
  [0, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14],
  [15, 16, 17],
  [18, 19, 20, 21, 22, 23],
  [24],
  [25],
  [26],
  [27],
  [28, 29, 30, 31],
];

var parentSentencesBySeg = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 6, 7, 8, 9, 9, 9, 9];

var parentCardsBySentence = [null, null, 0, 0, 1, null, null, 2, 2, 2];

var nextSentencesByCard = [5, 5, null];

var indentsBySentence = [0, 148, null, null, null, 269, 129, null, null, null];

//

/*t0 = performance.now();
t1 = performance.now();
console.log((t1 - t0).toFixed(3) + 'ms');*/
