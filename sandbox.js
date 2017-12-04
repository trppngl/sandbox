var column = document.getElementById('column');
var highlightPane = document.getElementById('highlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

var fragment = document.createDocumentFragment();

var extensionWidth = 8;

//

function getRectsFromEls(els) {
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  
  var columnRect = column.getBoundingClientRect();
  var columnTop = columnRect.top;
  var columnLeft = columnRect.left;
  
  var rects = [];
  els = [].concat(els || [])
  
  for (var i = 0; i < els.length; i++) {
    theseRects = els[i].getClientRects();
    for (var j = 0; j < theseRects.length; j++) {
      rects.push({
        top: theseRects[j].top += scrollTop - columnTop,
        left: theseRects[j].left += scrollLeft - columnLeft,
        width: theseRects[j].width
      });
    }
  }
  
  return rects;
}

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

function cachePrevDist(rects) {
  
  rects[0].prevDist = 0;
  
  for (var i = 1; i < rects.length; i++) {
    rects[i].prevDist = rects[i - 1].prevDist + rects[i - 1].width;
  }
}

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
} */

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
  
  var t0 = performance.now();
  
  startLine = getLineFromPt(startPt);
  endLine = getLineFromPt(endPt - 1);
  
  var t1 = performance.now();
  console.log((t1 - t0).toFixed(4), 'milliseconds');
  
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

var visLineRects = getLineRectsFromRects(getRectsFromEls(segs));

cachePrevDist(visLineRects);
