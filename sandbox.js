var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

var segOffsets = [];

var fragment = document.createDocumentFragment();

var extensionWidth = 8;

// ease-in-out (.42,0,.58,1) 30 frames
var easingMultipliers = [0.00213, 0.00865, 0.01972, 0.03551, 0.05613, 0.08166, 0.11211, 0.14741, 0.18740, 0.23177, 0.28013, 0.33188, 0.38635, 0.44269, 0.50000, 0.55731, 0.61365, 0.66812, 0.71987, 0.76823, 0.81260, 0.85259, 0.88789, 0.91834, 0.94387, 0.96449, 0.98028, 0.99135, 0.99787, 1.00000] // 0.00000?

var totalFrames = easingMultipliers.length; // ...length - 1?
var currentFrame = -1;

var slideHighlight = {
  start: new SlideLineOffset(0, 0, 0, 0),
  end: new SlideLineOffset(0, 0, 0, 0)
}

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
      
      // And will need to empty segOffsets when calling getLineRectsFromEls()
      
      if (j === 0) {
        startLine = lineRects.length - 1;
        startOffset = left;
      }
      
      if (j === theseRects.length - 1) {
        endLine = lineRects.length - 1;
        endOffset = currentLineRect.width;
        segOffsets[i] = {
          startLine: startLine,
          startOffset: startOffset,
          endLine: endLine,
          endOffset: endOffset
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

// Pass first and last line instead of rects? No slicing, no garbage colleciton of sliced array?

function makeHighlightBoxes(rects, startOffset, endOffset) {
  
  var box;
  var top;
  var left;
  var width;
  
  for (var i = rects.length - 1; i >= 0; i--) {
    
    top = rects[i].top;
    left = rects[i].left;
    width = rects[i].width;
    
    if (endOffset && i === rects.length - 1) {
      width = endOffset;
    }
    
    if (startOffset && i === 0) {
      left += startOffset;
      width -= startOffset;
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

//

function SlideLineOffset(line, offset, distance, progress) {
  this.line = line,
  this.offset = offset,
  this.distance = distance,
  this.progress = progress
}

// Below could be isAbove, isBefore, isHigher, isFirst, isEarlier...

SlideLineOffset.prototype.isAbove = function(targetLineOffset) {
  
  if (this.line < targetLineOffset.line || this.line === targetLineOffset.line && this.offset < targetLineOffset.offset) {
    return true;
  } else {
    return false;
  }
}

SlideLineOffset.prototype.getDistanceFrom = function(targetLineOffset) {
  
  var distance = 0;
  
  var aboveLineOffset;
  var belowLineOffset;
  
  var forward = this.isAbove(targetLineOffset);
  
  if (forward) {
    aboveLineOffset = this;
    belowLineOffset = targetLineOffset;
  } else {
    aboveLineOffset = targetLineOffset;
    belowLineOffset = this;
  }
  
  var i = aboveLineOffset.line;
  while (i <= belowLineOffset.line) {
    distance += visLineRects[i].width;
    i++;
  }
  
  distance -= aboveLineOffset.offset;
  distance -= visLineRects[belowLineOffset.line].width - belowLineOffset.offset;
  
  if (!forward) {
    distance = -distance;
  }
    
  this.distance = distance;
}

//

function getDistanceBetweenOffsets(firstLine, lastLine, firstOffset, lastOffset) { // Defaults? Some optional? Inelegant?
  
  var distance = 0;
  var multiplier = 1;
  
  if (lastLine < firstLine || lastLine === firstLine && lastOffset < firstOffset) {
    
    // Next two lines swap vars
    lastLine = firstLine + (firstLine = lastLine, 0);
    lastOffset = firstOffset + (firstOffset = lastOffset, 0);
    multiplier = -1;
    console.log(firstLine, lastLine, firstOffset, lastOffset);
  }
  
  // Better way to do all this without swapping vars?
  
  var i = firstLine;
  while (i <= lastLine) {
    distance += visLineRects[i].width;
    i++;
  }
  
  distance -= firstOffset;
  distance -= visLineRects[lastLine].width - lastOffset;
  
  distance = distance * multiplier;
  
  return distance;
}

function ease(distance, frame) { // Make frame param or global var?
  return Math.round(distance * easingMultipliers[frame]);
}

// When not animating, should frame be -1 or 0?
// Should first change occur in frame 0 or 1?

/*
Instead of var animating, could use currentFrame?

function beginAnimation() {
  if (currentFrame > -1) ...
*/

function beginAnimation() {
  if (currentFrame > -1) {
    currentFrame = 0; // ?
  } else {
    currentFrame = 0; // DRY?
    requestAnimationFrame(animate);
  }
}

function animate() {
  
  console.log(currentFrame, easingMultipliers[currentFrame]);
  
  if (currentFrame < totalFrames - 1) { // ?
    currentFrame++; // ?
    requestAnimationFrame(animate);
  } else {
    currentFrame = -1; // ?
  }
}

/*

function abcd(startPt, endPt) {
  
  var startOffset;
  var endOffset;
  var lineRects; // Change?
  
  // startLine = getLineFromPt(startLine, startPt);
  // endLine = getLineFromPt(endLine, endPt - 1);
  
  startLine = getLineFromPt(startPt);
  endLine = getLineFromPt(endPt - 1);
  
  startOffset = startPt - visLineRects[startLine].prevDist;
  endOffset = endPt - visLineRects[endLine].prevDist;
  
  console.log('Start line: ' + startLine);
  console.log('Start offset: ' + startOffset);
  console.log('End line: ' + endLine);
  console.log('End offset: ' + endOffset);
  
  if (endLine < visLineRects.length - 1) {
    lineRects = visLineRects.slice(startLine, endLine + 1);
  } else {
    lineRects = visLineRects.slice(startLine);
  }
  
  makeHighlightBoxes(lineRects, startOffset, endOffset);
  
}

// Adapted from trippingly.js

function startSeg(targetIndex) {
  currentFrame = 1;
  prepAnimation(targetIndex);
  animating = true;
}

function prepAnimation(targetIndex) {
  
  var targetSeg = segs[targetIndex];
  var targetSegRect = targetSeg.getBoundingClientRect();
  
  targetStart = target
  targetEnd = 
  
  initialStart = currentStart // ?
  initialEnd = currentEnd // ?
  
  //
  
  startTop = highlight.offsetTop;
  startHt = highlight.clientHeight;
  
  var seg = segs[currentIndex];
  endTop = seg.offsetTop;
  endHt = seg.clientHeight;
}

function animate() {
    
  currentStart = ease(initialStart, targetStart);
  currentEnd = ease(initialEnd, targetEnd);

  abcd(currentStart, currentEnd);

  if (currentFrame < totalFrames) {
    currentFrame += 1;
    requestAnimationFrame(animate);
  }
}

*/

//

var t0 = performance.now();

var visLineRects = getLineRectsFromEls(segs);

var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');

