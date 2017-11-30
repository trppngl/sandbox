var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');
// Or navigate from column?

var fragment = document.createDocumentFragment();

function getlineRectsFromSegs(startSeg, endSeg, startOffset, endOffset) {
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  var extensionWidth = 8;
  
  var range = document.createRange();
  var startNode = startSeg.firstChild;
  var endNode = endSeg.firstChild;
  
  var rangeRects;
  var lineRects = [];
  var currentLineRect;
  
  startOffset = startOffset || 0;
  endOffset = endOffset || endNode.length;
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  rangeRects = range.getClientRects();
  
  for (var i = 0; i < rangeRects.length; i++) {
    
    // Range may have empty elements with weird tops; skip them
    if (rangeRects[i].width) {
      
      // Last (most recently added) lineRect
      currentLineRect = lineRects[lineRects.length - 1];
      
      // New lineRect if none exist yet or tops don't match
      if (!currentLineRect || currentLineRect.top !== rangeRects[i].top) {
        lineRects.push({
          top: rangeRects[i].top + scrollTop - columnTop,
          left: rangeRects[i].left + scrollLeft - columnLeft,
          width: rangeRects[i].width + extensionWidth
        });
      } else {
        currentLineRect.width += rangeRects[i].width;
      }
    }
  }

  // Only applies to very last line; should it also apply elsewhere?
  lineRects[lineRects.length - 1].width -= extensionWidth;
  return lineRects;
}

/*function getLineRectsFromRange(range) {
  var rangeRects = range.getClientRects();
  var lineRects = [];
  var currentLineRect;
  for (var i = 0; i < rangeRects.length; i++) {
    if (rangeRects[i].width) { // Range may have empty elements with weird tops; skip them
      currentLineRect = lineRects[lineRects.length - 1]; // Last item in array
      if (currentLineRect && currentLineRect.top === rangeRects[i].top) {
        currentLineRect.width += rangeRects[i].width;
      } else { // Either no lineRects yet (first time) or tops don't match
        lineRects.push({
          top: rangeRects[i].top,
          left: rangeRects[i].left,
          width: rangeRects[i].width
        });
      }
    }
  }
  return lineRects;
}

// Three DOM measurements... Problem?

// Combine functions immediately above and below?

function adjustLineRects(lineRects) {
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  var extensionWidth = 8;
  for (var i = 0; i < lineRects.length; i++) {
    lineRects[i].top += scrollTop - columnTop;
    lineRects[i].left += scrollLeft - columnLeft;
    if (i < lineRects.length - 1) {
      lineRects[i].width += extensionWidth;
    }
  }
  return lineRects;
}*/

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

var t0 = performance.now();
var lineRects = getlineRectsFromSegs(seg0, seg23);
var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');

makeHighlightBoxes(lineRects);