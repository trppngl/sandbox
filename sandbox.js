var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var numSegs = segs.length;

var segOffsets = [];

(function () {
  for (var i = 0; i < numSegs; i += 1) {
    segs[i].id = i;
  }
})();

var fragment = document.createDocumentFragment();

var extensionWidth = 8;

// ease-in-out (.42,0,.58,1) 30 frames
var easingMultipliers = [0.00213, 0.00865, 0.01972, 0.03551, 0.05613, 0.08166, 0.11211, 0.14741, 0.18740, 0.23177, 0.28013, 0.33188, 0.38635, 0.44269, 0.50000, 0.55731, 0.61365, 0.66812, 0.71987, 0.76823, 0.81260, 0.85259, 0.88789, 0.91834, 0.94387, 0.96449, 0.98028, 0.99135, 0.99787, 1.00000] // 0.00000?

var totalFrames = easingMultipliers.length; // ...length - 1?
var currentFrame = -1;

var slideHighlight = {
  start: new MovingPos(),
  end: new MovingPos()
}

var t0 = performance.now();

var visLineRects = getLineRectsFromEls(segs);

var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');

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

function MovingPos(line = 0, offset = 0, distance = 0, progress = 0) {
  this.line = line,
  this.offset = offset,
  this.distance = distance,
  this.progress = progress
}

// isAbove, isBefore, isHigher, isFirst, isEarlier, isUpstreamFrom...

MovingPos.prototype.isAbove = function(targetPos) {
  
  if (this.line < targetPos.line || this.line === targetPos.line && this.offset < targetPos.offset) {
    return true;
  } else {
    return false;
  }
}

// measureMoveTo, measMoveTo, calcMoveTo, getMoveTo, getChangeTo, getPosChangeTo, calcPosChangeTo, measPosChangeTo, getShiftTo, measShiftTo, calcShiftTo, measSlideTo, measureSlideTo, calcSlideTo, update..., ...displacement...

MovingPos.prototype.prepChangePos = function(targetPos) {
  
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

MovingPos.prototype.changePos = function(frame) {
  
  var increment = Math.round(this.distance * easingMultipliers[frame] - this.progress);
  
  this.progress += increment;
  this.offset += increment;
  
  // Start and end should be treated differently by 1px
  
  while (this.offset <= 0) {
    this.line--;
    this.offset += visLineRects[this.line].width;
  }
  
  while (this.offset > visLineRects[this.line].width) {
    this.offset -= visLineRects[this.line].width;
    this.line++;
  }
  
  return this;
  
}

//

function prepAnimate(targetSeg) {
  // console.log(slideHighlight.start);
  slideHighlight.start.prepChangePos(targetSeg.start);
  // console.log(slideHighlight.start);
  slideHighlight.end.prepChangePos(targetSeg.end);
  currentFrame = 0;
  requestAnimationFrame(animate); // Cancel?
}

function animate() { // Clean this up
  
  slideHighlight.start.changePos(currentFrame);
  slideHighlight.end.changePos(currentFrame);
  var rects = visLineRects.slice(slideHighlight.start.line, slideHighlight.end.line + 1);
  var startOffset = slideHighlight.start.offset;
  var endOffset = slideHighlight.end.offset;
  makeHighlightBoxes(rects, startOffset, endOffset);
  // console.log(currentFrame, slideHighlight.start.line, slideHighlight.start.offset, slideHighlight.end.line, slideHighlight.end.offset);
  if (currentFrame < totalFrames - 1) {
    currentFrame++
    requestAnimationFrame(animate);
  } else {
    currentFrame = -1;
  }
}

// Event Handlers

function handleClick(e) {
  
  var index;
  
  if (e.target.classList.contains('seg')) {
    index = Number(e.target.getAttribute('id'));
    prepAnimate(segOffsets[index]);
  }
}

// Event Listeners

column.addEventListener('click', handleClick, false); // document?
