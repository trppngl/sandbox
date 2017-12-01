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
  
  var columnTop = column.offsetTop;
  var columnLeft = column.offsetLeft;
  
  var els = [].concat(els || [])
  var rects = [];
  
  for (i = 0; i < els.length; i++) {
    theseRects = els[i].getClientRects();
    for (j = 0; j < theseRects.length; j++) {
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

makeHighlightBoxes(getLineRectsFromRects(getRectsFromEls(segs)));

var t1 = performance.now();
console.log((t1 - t0).toFixed(4), 'milliseconds');
