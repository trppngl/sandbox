'use strict';

var t0; // Temp
var t1; // Temp

var audio = document.getElementById('audio'); // audioEl?
var playAllMode = false; // Rename?
var segMode = true; // Rename?

var columnEl = document.getElementById('column');

var currentCardIndex = null;
var currentSegIndex = -1;

// Temp, below should be arrays, not HTMLCollections

var slideboxEls = document.getElementsByClassName('slidebox');

var sentenceEls = document.getElementsByClassName('sentence');
var segEls = document.getElementsByClassName('seg');

var numSentences = sentenceEls.length;
var numSegs = segEls.length;

var cardEls = document.getElementsByClassName('card');

var indentSegEl = null;

// Notes

// Put indent() and unindent() inside toggleCard()?

function indent() { // Works, but could be better?
  
  var indent;
  var nextSentence = nextSentencesByCard[currentCardIndex];
  
  if (nextSentence) {
    
    indentSegEl = segEls[getFirstSegInSentence(nextSentence)];
    indent = indentsBySentence[nextSentence];
  
    indentSegEl.style.marginLeft = indent + 'px';
  }
}

function unindent() {
  
  if (indentSegEl) {
    
    indentSegEl.style.marginLeft = '';
    indentSegEl = null; // Unnecessary?
  }
}

function showCard(targetCardIndex) { // Unfinished
  
  show(cardEls[targetCardIndex]);
}

function hideCard(targetCardIndex) { // Unfinished
  
  hide(cardEls[targetCardIndex]);
}

function toggleCard(targetCardIndex) {
  
  if (currentCardIndex !== null) { // If currentSegIndex is in card being closed, it should be changed to first/last seg in prevVisSentence (depending on segMode)
    
    hide(cardEls[currentCardIndex]);
    unindent();
  }
  
  if (targetCardIndex !== null && targetCardIndex !== currentCardIndex) {
    
    currentCardIndex = targetCardIndex;
    show(cardEls[currentCardIndex]);
    indent();
    
  } else {
    
    currentCardIndex = null;
  }
}

function toggleNextCard() {
  
  if (currentCardIndex === null) {
    
    toggleCard(0)
    
  } else if (cardEls[currentCardIndex + 1]) {
    
    toggleCard(currentCardIndex + 1);
  }
}

function togglePrevCard() {
  
  if (currentCardIndex === null) {
    
    toggleCard(cardEls.length - 1);
    
  } else if (cardEls[currentCardIndex - 1]) { // Or if (cCI > 0)
    
    toggleCard(currentCardIndex - 1);
  }
}

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
  if (isValidSentenceIndex(sentenceIndex)) {
    return childSegsBySentence[sentenceIndex][0];
  }
}

function getLastSegInSentence(sentenceIndex) {
  
  var lastSegIndex
  
  if (isValidSentenceIndex(sentenceIndex)) {
    
    lastSegIndex = childSegsBySentence[sentenceIndex].length - 1;
    return childSegsBySentence[sentenceIndex][lastSegIndex];
  }
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

function isVisSentence(sentenceIndex) { // Merge with isVisSeg()?
  var parentCardIndex = parentCardsBySentence[sentenceIndex];
  return (parentCardIndex === null || parentCardIndex === currentCardIndex);
}

function isVisSeg(segIndex) { // Merge with isVisSentence()?
  var parentCardIndex = parentCardsBySentence[parentSentencesBySeg[segIndex]];
  return (parentCardIndex === null || parentCardIndex === currentCardIndex);
}

function isValidSentenceIndex(sentenceIndex) { // Merge?
  return Boolean(sentenceEls[sentenceIndex]); // Use diff array?
}

function isValidSegIndex(segIndex) { // Merge?
  return Boolean(segEls[segIndex]); // Use diff array?
}

function getPrevVisSentence(sentenceIndex) { // Merge?
  if (isValidSentenceIndex(sentenceIndex)) {
    for (var i = sentenceIndex - 1; i >= 0; i--) {
      if (isVisSentence(i)) {
        return i;
      }
    }
  }
}

function getPrevVisSeg(segIndex) { // Merge?
  if (isValidSegIndex(segIndex)) {
    for (var i = segIndex - 1; i >= 0; i--) {
      if (isVisSeg(i)) {
        return i;
      }
    }
  }
}

function getNextVisSentence(sentenceIndex) { // Merge?
  if (isValidSentenceIndex(sentenceIndex)) {
    for (var i = sentenceIndex + 1; i < numSentences; i++) {
      if (isVisSentence(i)) {
        return i;
      }
    }
  }
}

function getNextVisSeg(segIndex) { // Merge?
  if (isValidSegIndex(segIndex)) {
    for (var i = segIndex + 1; i < numSegs; i++) {
      if (isVisSeg(i)) {
        return i;
      }
    }
  }
}

//

function togglePlayAllMode() {
  if (audio.paused) {
    playAllMode = true;
    next();
  } else {
    playAllMode = !playAllMode;
  }
}

function toggleSegMode() {
  segMode = !segMode;
}

//

function getPrevTargetSegIndex() { // Rename?
  
  if (segMode) {
    
    if (audio.currentTime > times[currentSegIndex][0] + 0.25) {
      
      return currentSegIndex;
      
    } else {
      
      return getPrevVisSeg(currentSegIndex);
    }
  } else {
    
    if (audio.currentTime >  times[getFirstSegInSentence(parentSentencesBySeg[currentSegIndex])][0] + 0.25) { // Shorter way?
      
      return getFirstSegInSentence(parentSentencesBySeg[currentSegIndex]); // Shorter way?
      
    } else {
      
      return getFirstSegInSentence(getPrevVisSentence(parentSentencesBySeg[currentSegIndex])); // Shorter way?
    }
  }
}

function prev() { // Temp
  
  var targetSegIndex = getPrevTargetSegIndex();
  
  if (targetSegIndex !== undefined) {
    
    if (segEls[currentSegIndex]) { // Temp
      segEls[currentSegIndex].style.background = '';
    }

    currentSegIndex = targetSegIndex;

    console.log(currentSegIndex);

    segEls[currentSegIndex].style.background = '#fff';
    playSeg(currentSegIndex);
  }
}

function next() { // Messy, new next seg functions should help
  
  if (segEls[currentSegIndex]) { // Temp
    
    segEls[currentSegIndex].style.background = '';
  }
  
  if (currentSegIndex === -1) { // OK? How to handle index -1?
    
    currentSegIndex = 0;
    
  } else if (segMode && getNextSiblingSeg(currentSegIndex)) { // !== null?

    currentSegIndex = getNextSiblingSeg(currentSegIndex);
    
  } else if (getNextVisSentence(parentSentencesBySeg[currentSegIndex])) { // !== null?
    
    currentSegIndex = getFirstSegInSentence(getNextVisSentence(parentSentencesBySeg[currentSegIndex])); // Too long
  }
  
  console.log(currentSegIndex);
  segEls[currentSegIndex].style.background = '#fff';
  playSeg(currentSegIndex);
}

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

function handleClick(e) { // Very temp!
  
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
      togglePlayAllMode();
      break;
    case 37:
      e.preventDefault();
      prev();
      break;
    case 39:
      e.preventDefault();
      next();
      break;
    case 83:
      toggleSegMode();
      break;
  }
}

// Event listeners

document.addEventListener('click', handleClick); // columnEl?
document.addEventListener('keydown', handleKeydown);

// Arrays temporarily populated manually

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
  [423.960, 426.252], // Les prix...
  [426.252, 428.298],
  [428.423, 429.948],
  [430.072, 432.614], // ...a manger.
  [433.848, 436.900], // Il y a dans...
  [437.201, 441.422],
  [441.422, 444.472], // ...de nourriture.
  [446.365, 451.690], // Face à...
  [452.050, 455.765],
  [456.124, 458.092],
  [458.092, 459.624],
  [459.920, 460.490],
  [460.490, 462.570], // ...la société française.
  [381.499, 386.316], // Le roi...sur Terre.
  [387.897, 392.791], // Un des rois...
  [392.952, 394.813],
  [394.984, 397.363], // ...le roi soleil.
  [405.043, 411.709], // En 1789...mauvaise.
  [412.197, 414.035], // La France...en crise.
  [414.789, 416.895], // Elle a...
  [417.071, 419.061],
  [419.498, 420.240],
  [420.240, 423.048], // ...ses dettes.
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
  [25, 26, 27],
  [28],
  [29],
  [30, 31, 32, 33],
];

var parentSentencesBySeg = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 6, 6, 6, 7, 8, 9, 9, 9, 9];

var parentCardsBySentence = [null, null, 0, 0, 1, null, null, 2, 2, 2];

var nextSentencesByCard = [5, 5, null];

var indentsBySentence = [0, 148, null, null, null, 269, 129, null, null, null]; // Possible there will be text sentences that don't follow cards in any mode (like 1 and 6 here). Don't bother getting their indents? Could speed things up just a bit?

//

/*t0 = performance.now();
t1 = performance.now();
console.log((t1 - t0).toFixed(3) + 'ms');*/
