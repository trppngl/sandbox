'use strict';

var t0; // Temp
var t1; // Temp

var audio = document.getElementById('audio'); // audioEl?

var columnEl = document.getElementById('column');

var playAllMode = false; // Rename?

var currentCardIndex = null; // For multiple visible cards, could use array
var currentSegIndex = -1; // null?

// Temp, below should be arrays, not HTMLCollections

var segEls = document.getElementsByClassName('seg');
var numSegs = segEls.length;

var sentenceEls = document.getElementsByClassName('sentence');
var numSentences = sentenceEls.length;

var cardEls = document.getElementsByClassName('card');

var slideboxEls = document.getElementsByClassName('slidebox');

var indentedSegEl = null;
var highlightedSegEl = null;

// Notes

// Put indent() and unindent() inside toggleCard()?

function indent() { // Works, but could be better?
  
  var indent = indentsByCard[currentCardIndex];
  var nextSegIndex = nextSegsByCard[currentCardIndex];
  
  if (nextSegIndex) {
    
    indentedSegEl = segEls[nextSegIndex];
    indentedSegEl.style.marginLeft = indent + 'px';
  }
}

function unindent() {
  
  if (indentedSegEl) {
    
    indentedSegEl.style.marginLeft = '';
    indentedSegEl = null; // Unnecessary?
  }
}

/*function showCard(targetCardIndex) { // Unfinished
  
  show(cardEls[targetCardIndex]);
}*/

/*function hideCard(targetCardIndex) { // Unfinished
  
  hide(cardEls[targetCardIndex]);
}*/

function toggleCard(targetCardIndex) {
  
  if (currentCardIndex !== null) { // If currentSegIndex is in card being closed, change to seg just before card?
    
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

/*function nextCard() {
  
  if (currentCardIndex === null) {
    
    toggleCard(0)
    
  } else if (cardEls[currentCardIndex + 1]) {
    
    toggleCard(currentCardIndex + 1);
  }
}*/

/*function prevCard() {
  
  if (currentCardIndex === null) {
    
    toggleCard(cardEls.length - 1);
    
  } else if (cardEls[currentCardIndex - 1]) { // Or if (cCI > 0)
    
    toggleCard(currentCardIndex - 1);
  }
}*/

// Helper functions

function show(el) { // Maybe only need showCard()?
  if (el) { // Check if element?
    el.classList.remove('hide');
  }
}

function hide(el) { // Maybe only need hideCard()?
  if (el) { // Check if element?
    el.classList.add('hide');
  }
}

function isVisSeg(segIndex) {
  var parentCardIndex = parentCardsBySeg[segIndex];
  return (parentCardIndex === null || parentCardIndex === currentCardIndex); // For multiple visible cards, could use array
}

function isValidSegIndex(segIndex) {
  return (Boolean(segEls[segIndex]) || segIndex === -1); // Temp, needs to allow -1?
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

//

function getPrevTargetSegIndex() { // Rename
  
  if (audio.currentTime > times[currentSegIndex][0] + 0.25 || currentSegIndex === 0) { // Second condition prevents skipping but will probably also slow highlight

    return currentSegIndex;

  } else {

    return getPrevVisSeg(currentSegIndex);
  }
}

function prev() { // Temp, almost identical to next(), merge?
  
  var targetSegIndex = getPrevTargetSegIndex();
  
  if (targetSegIndex !== undefined) {
    
    currentSegIndex = targetSegIndex;
    playSeg(currentSegIndex);
    highlight();
  }
}

function getNextTargetSegIndex() { // Rename
  
  return getNextVisSeg(currentSegIndex);
}

function next() { // Temp, almost identical to prev(), merge?
  
  var targetSegIndex = getNextTargetSegIndex();
  
  if (targetSegIndex !== undefined) {
    
    currentSegIndex = targetSegIndex;
    playSeg(currentSegIndex);
    highlight();
  }
}

function playSeg(index) { // Temp
  
  currentSegIndex = index;
  audio.currentTime = times[currentSegIndex][0];
  if (audio.paused) {
    audio.play();
  }
}

//

function animate() { // Temp
  
  if (!audio.paused) {
    checkStop();
  }
  
  requestAnimationFrame(animate);
}

animate();

//

function checkStop() {
  
}

// Temp highlight

function highlight() { // Temp, won't be needed
  
  if (highlightedSegEl) {
    
    highlightedSegEl.style.background = '';
  }
  
  highlightedSegEl = segEls[currentSegIndex];
  
  if (highlightedSegEl) {
    
    highlightedSegEl.style.background = '#fff';
  }
}

// Slide highlight

/*function makeHighlightBoxes(lineRange) { // From bastille
  
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

/*function resizeSlidebox(index, left, width) {
  
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
}*/

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

var parentCardsBySeg = [null, null, null, null, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, null, null, null, null, 2, 2, 2, 2, 2, 2];

var nextSegsByCard = [24, 24, null];

var indentsByCard = [269, 269, null]; // Do this by card? By sentence? By seg?

//

/*t0 = performance.now();
t1 = performance.now();
console.log((t1 - t0).toFixed(3) + 'ms');*/
