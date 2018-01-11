var audio = document.getElementById('audio');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var numSegs = segs.length;

// Use IIFE as below or something else?
// Somehow do below while initially making segs array?

(function () {
  for (var i = 0; i < numSegs; i += 1) {
    segs[i].id = i;
  }
})();

var segData = [];

// Change below (and elsewhere) to allow for segs without audio data?

(function () {
  
  var seg;
  var audioData;
  
  for (var i = 0; i < numSegs; i += 1) {
    seg = segs[i];
    audioData = seg.getAttribute('data-audio').split(' ');
    segData.push({
      'sprite': audioData[0],
      'start': Number(audioData[1]),
      'stop': Number(audioData[2])
    });
  }
})();

var notes = [];
notes.push.apply(notes, document.getElementsByClassName('note'));
// var numNotes = notes.length; // Needed?

var currentIndex = -1;

var playAll = false;

var audioTimer;

var textSegs = []; // Needed? Only used in one place...
textSegs.push.apply(textSegs, document.getElementsByClassName('text-seg'));
var numTextSegs = textSegs.length; // Needed?

//

var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var numSegs = segs.length;

var segRanges = [];

(function () {
  for (var i = 0; i < numSegs; i += 1) {
    segs[i].id = i;
  }
})();

var fragment = document.createDocumentFragment();

var extensionWidth = 0;

// ease-in-out (.42,0,.58,1) 30 frames
// var easingMultipliers = [0.00213, 0.00865, 0.01972, 0.03551, 0.05613, 0.08166, 0.11211, 0.14741, 0.18740, 0.23177, 0.28013, 0.33188, 0.38635, 0.44269, 0.50000, 0.55731, 0.61365, 0.66812, 0.71987, 0.76823, 0.81260, 0.85259, 0.88789, 0.91834, 0.94387, 0.96449, 0.98028, 0.99135, 0.99787, 1.00000] // 0.00000?

// default ease (.25,.1,.25,1) 15 frames
var easingMultipliers = [0.05020, 0.15242, 0.29524, 0.44476, 0.57586, 0.68254, 0.76715, 0.83357, 0.88523, 0.92482, 0.95443, 0.97563, 0.98967, 0.99753, 1.00000] // 0.00000?

var totalFrames = easingMultipliers.length; // ...length - 1?
var currentFrame = -1;

var currentSeg = -1;

var slideHighlight = {
  start: new MovingPos(),
  end: new MovingPos()
}

var visLineRects = getLineRectsFromEls(segs);

var request;

var frameTimes = []; //

//

function getLineRectsFromEls(els) {
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  
  var theseRects;
  var lineRects = [];
  var currentLineRect;
  
  var top;
  var left;
  var width;
  
  var startLine;
  var startOffset;
  var endLine;
  var endOffset;
  
  els = [].concat(els || []); // var els?
  
  for (var i = 0; i < els.length; i++) {
    
    theseRects = els[i].getClientRects();
    
    for (var j = 0; j < theseRects.length; j++) {
      
      top = theseRects[j].top + scrollTop - columnTop;
      left = theseRects[j].left + scrollLeft - columnLeft;
      width = theseRects[j].width;
      
      if (!currentLineRect || currentLineRect.top !== top) {
        
        /* if (currentLineRect && currentLineRect.top !== top) {
          currentLineRect.width += extensionWidth;
        } */
        
        lineRects.push({
          top: top,
          left: left,
          width: width
        });
        
        currentLineRect = lineRects[lineRects.length - 1];
        
      } else {
        
        currentLineRect.width = left + width;
        
      }
      
      // Do two blocks below only if dealing with segs, not note highlights?
      
      // And will need to empty segRanges when calling getLineRectsFromEls()
      
      if (j === 0) {
        startLine = lineRects.length - 1;
        startOffset = left;
      }
      
      if (j === theseRects.length - 1) {
        endLine = lineRects.length - 1;
        endOffset = currentLineRect.width;
        
        // segRanges[i] = new LineRange(startLine, startOffset, endLine, endOffset);
        
        segRanges[i] = {
          start: {
            line: startLine,
            offset: startOffset
          },
          end: {
            line: endLine,
            offset: endOffset
          }
        };
      }
    }
  }
  
  // Could make this a separate function and call from here
  
  for (var k = 0; k < lineRects.length - 1; k++) {

    lineRects[k].width += extensionWidth;

  }
  
  return lineRects;
}

function makeHighlightBoxes(lineRange) {
  
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
}

function MovingPos(line = 0, offset = 0, distance = 0, progress = 0) {
  this.line = line,
  this.offset = offset,
  this.distance = distance,
  this.progress = progress
}

MovingPos.prototype.isAbove = function(targetPos) {
  
  if (this.line < targetPos.line || this.line === targetPos.line && this.offset < targetPos.offset) {
    return true;
  } else {
    return false;
  }
}

MovingPos.prototype.getDistanceTo = function(targetPos) {
  
  var forward = this.isAbove(targetPos);
  var distance = 0;
  
  var i;
  var aboveOffset;
  var belowLine;
  var belowOffset;
  
  if (forward) {
    i = this.line;
    aboveOffset = this.offset;
    belowLine = targetPos.line;
    belowOffset = targetPos.offset;
  } else {
    i = targetPos.line;
    aboveOffset = targetPos.offset;
    belowLine = this.line;
    belowOffset = this.offset;
  }
  
  for (i; i <= belowLine; i++) {
    distance += visLineRects[i].width;
  }
  
  distance -= aboveOffset + visLineRects[belowLine].width - belowOffset;
  
  if (!forward) {
    distance = 0 - distance;
  }
    
  this.distance = distance;
  this.progress = 0;
  
  return this;
}

MovingPos.prototype.changePos = function(frame, isEnd) {
  
  var increment = Math.round(this.distance * easingMultipliers[frame] - this.progress);
  
  var nudge; // Rename?
  
  if (isEnd) {
    nudge = -1;
  } else {
    nudge = 0;
  }
  
  this.progress += increment;
  this.offset += increment;
  
  // When going backward, nudge makes it so start offset = 0 remains on that line, end offset = 0 moves up a line
  while (this.line > 0 && this.offset + nudge < 0) {
    this.line--;
    this.offset += visLineRects[this.line].width;
  }
  
  // When going forward, nudge makes it so start offset = line width moves down a line, end offset = line width remains on that line
  while (this.line < visLineRects.length - 1 && this.offset + nudge >= visLineRects[this.line].width) {
    this.offset -= visLineRects[this.line].width;
    this.line++;
  }
  
  return this;
}

function playSeg(index, click) {
  
  var targetSegRange = segRanges[index];
  
  slideHighlight.start.getDistanceTo(targetSegRange.start);
  slideHighlight.end.getDistanceTo(targetSegRange.end);
  
  if (click) {
    currentFrame = totalFrames - 1;
  } else {
    currentFrame = 0;
  }
  
  currentIndex = index;
  audio.currentTime = segData[currentIndex].start;
  if (audio.paused) {
    playAudio();
  }
  
  cancelAnimationFrame(request);
  request = requestAnimationFrame(animate);
}

function animate() {
  
  slideHighlight.start.changePos(currentFrame);
  slideHighlight.end.changePos(currentFrame, true);
  
  makeHighlightBoxes(slideHighlight); // Or pass start, end?
  
  if (currentFrame < totalFrames - 1) {
    currentFrame++
    request = requestAnimationFrame(animate);
  } else {
    currentFrame = -1;
  }
}

// // //

// For older browsers that don't have nextElementSibling
function getNextElementSibling(el) {
  if (el.nextElementSibling) {
    return el.nextElementSibling;
  } else {
    do {
      el = el.nextSibling;
    } while (el && el.nodeType !== 1);
    return el;
  }
}

// Should this go here or elsewhere?
function getNextSeg(el) {
  do {
    el = getNextElementSibling(el);
  } while (el && el.classList.contains('seg') !== true);
  return el;
}

// Indentation

// In FF, first rect empty if wrap pushes span to start on new line 
function getSegLeft(seg) {
  var rects = seg.getClientRects();
  for (var i = 0; i < rects.length; i += 1) {
    if (rects[i].width) {
      return rects[i].left;
    }
  }
}

function getTextLeft() {
  var textLeft = getSegLeft(textSegs[0]);
  return textLeft;
}

function indent(arrayOrSeg) { // Array not needed?
  var segLeft;
  var segIndent;
  var textLeft = getTextLeft();
  var sgs = [].concat(arrayOrSeg || []).reverse(); // Bottom-up
  for (var i = 0; i < sgs.length; i += 1) { // Does top seg, no need
    segLeft = getSegLeft(sgs[i]);
    segIndent = segLeft - textLeft;
    if (segIndent) {
      sgs[i].style.marginLeft = segIndent + 'px';
    }
  }
}

// Show and hide notes

function hideNotes(arrayOrNote) {
  var nts = [].concat(arrayOrNote || []);
  for (var i = 0; i < nts.length; i += 1) {
    if (getNextSeg(nts[i])) {
      getNextSeg(nts[i]).style.marginLeft = '';
    }
    nts[i].classList.add('hide');
  }
}

function showNotes(arrayOrNote) {
  var nts = [].concat(arrayOrNote || []);
  console.log(nts);
  hideNotes(notes);
  // For each note to be shown...
  for (var i = 0; i < nts.length; i += 1) {
    // ...indent seg underneath...
    indent(getNextSeg(nts[i]));
    // ...and show that note
    nts[i].classList.remove('hide');
  }
}

// Temporary

function moveHighlight(move) {
  if (segs[currentIndex]) {
    segs[currentIndex].classList.remove('highlight');
  }
  segs[move.targetIndex].classList.add('highlight');
}

//

function startSeg(move) {
  moveHighlight(move);
  currentIndex = move.targetIndex;
  if (move.skip) {
    audio.currentTime = segData[currentIndex].start;
    if (audio.paused) {
      playAudio();
    }
  }
}

function playAudio() {
  audio.play();
  audioTimer = window.setInterval(checkStop, 20);
}

function checkStop() {
  var nextVisibleIndex;
  
  if (audio.currentTime > segData[currentIndex].stop) {

    if (!playAll) {
      pauseAudio();
      
    } else {
      nextVisibleIndex = getNextVisibleIndex();
      
      if (nextVisibleIndex === undefined) {
        pauseAudio();
        playAll = false;
        
      } else if (segData[nextVisibleIndex].sprite !== segData[currentIndex].sprite) {
        playSeg(nextVisibleIndex);
        
      } else if (audio.currentTime > segData[nextVisibleIndex].start) {
        playSeg(nextVisibleIndex);
      }
    }
  }
}

function pauseAudio() {
  audio.pause();
  window.clearInterval(audioTimer);
}

function getNextVisibleIndex() {
  var ndx = currentIndex + 1;
  while (ndx < numSegs) { //
    if (segs[ndx].offsetHeight) {
      return ndx;
    } else {
      ndx += 1;
    }
  }
}

function getPrevVisibleIndex() {
  var ndx = currentIndex - 1;
  while (ndx >= 0) { 
    if (segs[ndx].offsetHeight) {
      return ndx;
    } else {
      ndx -= 1;
    }
  }
}

function next() {
  var nextVisibleIndex = getNextVisibleIndex();
  if (nextVisibleIndex !== undefined) {
    playSeg(nextVisibleIndex);
  }
}

function prev() {
  var prevVisibleIndex = getPrevVisibleIndex();
  var threshold = segData[currentIndex].start + 0.25;
  if (audio.currentTime > threshold || prevVisibleIndex === undefined) {
    playSeg(currentIndex);
  } else {
    playSeg(prevVisibleIndex);
  }
}

/*function prev() {
  var prevVisibleIndex = getPrevVisibleIndex();
  if (prevVisibleIndex !== undefined) {
    playSeg(prevVisibleIndex);
  }
}

function current() {
  playSeg(currentIndex);
}*/

function togglePlayAll() {
  if (audio.paused) {
    playAll = true;
    next();
  } else {
    playAll = !playAll;
  }
}

// Event handlers

/*function handleClick(e) {
  var clickIndex;
  if (e.target.classList.contains('seg')) {
    clickIndex = Number(e.target.getAttribute('id'));
  }
  if (clickIndex !== undefined) {
    startSeg({
      targetIndex: clickIndex,
      skip: true
    });
  }
}*/

function handleClick(e) {
  
  var index;
  
  if (e.target.classList.contains('seg')) {
    index = Number(e.target.getAttribute('id'));
    playSeg(index, true);
  }
}

function handleKeydown(e) {
  switch(e.keyCode) {
    case 37:
      prev();
      break;
    case 39:
      next();
      break;
    case 32:
      e.preventDefault(); // So browser doesn't jump to bottom
      togglePlayAll();
      break;
  }
}

/*function handleKeydown(e) {
  switch(e.keyCode) {
    case 37:
      prev();
      break;
    case 38:
      e.preventDefault();
      togglePlayAll();
      break;
    case 39:
      next();
      break;
    case 40:
      e.preventDefault();
      current();
      break;
    case 32:
      e.preventDefault(); // So browser doesn't jump to bottom
      togglePlayAll();
      break;
  }
}*/

// Event listeners

document.addEventListener('click', handleClick, false);
document.addEventListener('keydown', handleKeydown, false);
