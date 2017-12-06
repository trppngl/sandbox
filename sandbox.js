var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

var fragment = document.createDocumentFragment();

var extensionWidth = 8;

// ease-in-out (.42,0,.58,1) 30 frames
var easingMultipliers = [0.00000, 0.00213, 0.00865, 0.01972, 0.03551, 0.05613, 0.08166, 0.11211, 0.14741, 0.18740, 0.23177, 0.28013, 0.33188, 0.38635, 0.44269, 0.50000, 0.55731, 0.61365, 0.66812, 0.71987, 0.76823, 0.81260, 0.85259, 0.88789, 0.91834, 0.94387, 0.96449, 0.98028, 0.99135, 0.99787, 1.00000]

var totalFrames = easingMultipliers.length - 1;
var currentFrame = 0;

var currentStart;
var currentEnd;

var initialStart;
var initialEnd;

var targetStart;
var targetEnd;

var segOffsets = [];

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
        
        lineRects.push({
          top: top,
          left: left,
          width: width
        });
        
        currentLineRect = lineRects[lineRects.length - 1];
        
      } else {
        
        currentLineRect.width = left + width;
        
      }
      
      if (j === 0) {
        startLine = lineRects.length - 1;
        startOffset = left;
      }
      
      if (j === theseRects.length - 1) {
        endLine = lineRects.length - 1;
        endOffset = currentLineRect.width;
        segOffsets.push({
          startLine: startLine,
          startOffset: startOffset,
          endLine: endLine,
          endOffset: endOffset
        });
      }
    }
  }
  
  // Could make this a separate function and call from here
  
  for (var k = 0; k < lineRects.length - 1; k++) {

    lineRects[k].width += extensionWidth;

  }
  
  /* if (currentLineRect && currentLineRect.top !== top) {
    currentLineRect.width += extensionWidth;
  } */
  
  return lineRects;
}

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

/*

function getLineRectsFromRects(rects) {
  
  var lineRects = [];

  for (var i = 0; i < rects.length; i++) {
    currentLineRect = lineRects[lineRects.length - 1];
    if (!currentLineRect || currentLineRect.top !== rects[i].top) {
      lineRects.push({
        top: rects[i].top,
        left: rects[i].left,
        width: rects[i].width
      });
    } else {
      currentLineRect.width = rects[i].left + rects[i].width;
    }
  }

  for (var i = 0; i < lineRects.length - 1; i++) {
    lineRects[i].width += extensionWidth;
  }
  
  return lineRects;
}

*/

//

/* function getLineFromPt(line, pt) {

  if (forward) {
    
    while (visLineRects[line].prevDist + visLineRects[line].width <= pt) {
      line++;
    }
    
  } else {

    while (visLineRects[startLine].prevDist > pt) {
      line--;
    }
  }
  
  return line;
}

// Below iterates up from 0 and is probably temporary; above iterates up or down from current line and is propably better but needs (forward) condition replaced

function getLineFromPt(pt) {

  var line = 0;
    
  while (visLineRects[line].prevDist + visLineRects[line].width <= pt) {
    line++;
  }
  
  return line;
}

var startLine = 0;
var endLine = 0;

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
    
  currentStart = Math.round(ease(initialStart, targetStart));
  currentEnd = Math.round(ease(initialEnd, targetEnd));

  abcd(currentStart, currentEnd);

  if (currentFrame < totalFrames) {
    currentFrame += 1;
    requestAnimationFrame(animate);
  }
}

function ease(startValue, endValue) {
  return (endValue - startValue) * easingMultipliers[currentFrame] + startValue;
}

function cachePrevDist(rects) {
  
  rects[0].prevDist = 0;
  
  for (var i = 1; i < rects.length; i++) {
    rects[i].prevDist = rects[i - 1].prevDist + rects[i - 1].width;
  }
}

*/

//

var t0 = performance.now();

var visLineRects = getLineRectsFromEls(segs);

var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');

