var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');
// Or navigate from column?

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var numSegs = segs.length;

var fragment = document.createDocumentFragment();

var segRects = [];

var lineRects = [];

// Maybe cache these and have vars that record if scroll or resize has occurred and update these a) when needed and b) if scroll or resize has occurred

var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
var columnRect = column.getBoundingClientRect();
var columnTop = columnRect.top;
var columnLeft = columnRect.left;
var extensionWidth = 8;

function getRectsFromSegs(segs) {
  
  var rects = [];
  
  for (i = 0; i < segs.length; i++) {
    theseRects = segs[i].getClientRects();
    for (j = 0; j < theseRects.length; j++) {
      rects.push(theseRects[j]);
    }
  }
  
  return rects;
}

function getLineRectsFromRects(rects) {

  for (var i = 0; i < rects.length; i++) {
    currentLineRect = lineRects[lineRects.length - 1];
    if (!currentLineRect || currentLineRect.top !== rects[i].top) {
      lineRects.push({
        top: rects[i].top,
        left: rects[i].left,
        width: rects[i].width
      });
    } else {
      currentLineRect.width = rects[i].right - currentLineRect.left;
    }
  }

  for (var i = 0; i < lineRects.length; i++) {
    lineRects[i].top += scrollTop - columnTop;
    lineRects[i].left += scrollLeft - columnLeft;
    if (i < lineRects.length - 1) {
      lineRects[i].width += extensionWidth;
    }
  }
  
  return lineRects;
}

// Getting lineRects from segs and from range very similar. Only the first part (producing an array of unjoined rects) is different.  Going from unjoined rects to lineRects almost the same. With rangeRects, an additional condition is needed at the outset to skip rects without width. The exact same thing could be done to segRects without slowing things down much. The third part, adjusting the rects, is identical.

function getLineRectsFromRange(startSeg, endSeg = startSeg, startOffset = 0, endOffset = endSeg.firstChild.length) {
  
  // Might want some of these vars to be global
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  var extensionWidth = 8;
  
  var range = document.createRange();
  var rangeRects;
  
  var lineRects = [];
  var currentLineRect;
  
  // DRY, probably temporary for use in console
  if (startOffset < 0) {
    startOffset = startSeg.firstChild.length + startOffset;
  }
  if (endOffset < 0) {
    endOffset = endSeg.firstChild.length + endOffset;
  }
  
  range.setStart(startSeg.firstChild, startOffset);
  range.setEnd(endSeg.firstChild, endOffset);
  rangeRects = range.getClientRects();
  
  console.log(rangeRects);
  
  for (var i = 0; i < rangeRects.length; i++) {
    
    // Range may have empty elements with weird tops; skip them
    if (rangeRects[i].width) {
      
      // Most recently added lineRect (may not exist)
      currentLineRect = lineRects[lineRects.length - 1];
      
      // New lineRect if none exist or tops don't match
      if (!currentLineRect || currentLineRect.top !== rangeRects[i].top) {
        lineRects.push({
          top: rangeRects[i].top,
          left: rangeRects[i].left,
          width: rangeRects[i].width
        });
      } else { // Else incorporate rangeRect into current lineRect
        currentLineRect.width += rangeRects[i].width;
      }
    }
  }

  for (var i = 0; i < lineRects.length; i++) {
    lineRects[i].top += scrollTop - columnTop;
    lineRects[i].left += scrollLeft - columnLeft;
    if (i < lineRects.length - 1) {
      lineRects[i].width += extensionWidth;
    }
  }
  
  return lineRects;
}

function makeHighlightBoxes(lineRects, startOffset, endOffset) {
  
  var box;
  var top;
  var left;
  var width;
  
  for (var i = lineRects.length - 1; i >= 0; i--) {
    
    top = lineRects[i].top;
    left = lineRects[i].left;
    width = lineRects[i].width;
    
    if (endOffset && i === lineRects.length - 1) {
      width = endOffset;
      console.log(width);
    }
    
    if (startOffset && i === 0) {
      left = startOffset;
      width -= startOffset;
    }
    
    box = document.createElement('div');
    box.style.top = top + 'px';
    box.style.left = left + 'px';
    box.style.width = width + 'px';
    box.classList.add('highlight-box'); // Change?
    fragment.appendChild(box);
  }
  
  highlightPane.innerHTML = '';
  highlightPane.appendChild(fragment);
}

// var t0 = performance.now();
// var t1 = performance.now();
// console.log((t1 - t0).toFixed(4), 'milliseconds');

// makeHighlightBoxes(lineRects);