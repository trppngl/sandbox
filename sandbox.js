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
console.log((t1 - t0).toFixed(3), 'milliseconds');

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

//

// Are Pos and LineRange constructors useful? Use object literals instead?

/*
function Pos(line = 0, offset = 0) {
  this.line = line,
  this.offset = offset
}

function LineRange(startLine = 0, startOffset = 0, endLine = 0, endOffset = 0) {
  this.start = new Pos(startLine, startOffset),
  this.end = new Pos(endLine, endOffset)
}
*/

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

//

function playSeg(targetSegRange) {
  
  slideHighlight.start.getDistanceTo(targetSegRange.start);
  slideHighlight.end.getDistanceTo(targetSegRange.end);
  
  currentFrame = 0;
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

// Event Handlers

function handleClick(e) {
  
  var index;
  
  if (e.target.classList.contains('seg')) {
    index = Number(e.target.getAttribute('id'));
    playSeg(segRanges[index]);
  }
}

// Event Listeners

column.addEventListener('click', handleClick, false); // document?

//

// console.log(currentFrame, slideHighlight.start.line, slideHighlight.start.offset, slideHighlight.end.line, slideHighlight.end.offset);

