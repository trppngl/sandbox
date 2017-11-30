var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');
// Or navigate from column?

var fragment = document.createDocumentFragment();

function getLineRectsFromSegs(startSeg, endSeg, startOffset, endOffset) {
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  var extensionWidth = 8;
  
  var rangeRects;
  var lineRects = [];
  var currentLineRect;
  
  var range = document.createRange();
  var startNode = startSeg.firstChild;
  var endNode = endSeg.firstChild;
  
  startOffset = startOffset || 0;
  endOffset = endOffset || endNode.length;
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  rangeRects = range.getClientRects();
  
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

var t0 = performance.now();
var lineRects = getLineRectsFromSegs(seg0, seg23);
var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');

makeHighlightBoxes(lineRects);