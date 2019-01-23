var textPane = document.getElementById('text-pane');
var spotlightPane = document.getElementById('spotlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var nSegs = segs.length;

var lines = [];
var segBoxesByLine = [];
var segRanges = [];
var spotlightBoxes = [];

var segBoxPadX = 3.5; //
var segBoxPadY = 5.5; //
var lineHeight = 44;
var extensionWidth = 7; //

var textPaneTop = 22; //

//

// getData() getPositions() crawlRects() getBounds() getBoxes()

function getBounds() {
  
  var rects;
  var rect;
  
  var top;
  var left;
  var width;
  var right;
  
  var textPaneRect = textPane.getBoundingClientRect(); //
  var textPaneTop = textPaneRect.top; //
  var textPaneLeft = textPaneRect.left; //
  
  var segBox = {};
  
  for (var i = 0; i < nSegs; i++) {
    
    rects = segs[i].getClientRects();
    segRanges[i] = {};
    
    for (var j = 0; j < rects.length; j++) {
      
      rect = rects[j];
      top = rect.top - segBoxPadY - textPaneTop;
      left = rect.left - segBoxPadX - textPaneLeft;
      width = rect.width + segBoxPadX * 2;
      
      if (j !== rects.length - 1) {
        
        width += extensionWidth;
      }
      
      right = left + width;
      
      segBox = {
        left: left,
        right: right,
        segIndex: i
      }
      
      if (isNewLine(top)) {
        
        lines.push({
          top: top,
          left: left,
          width: width
        });
        
        segBoxesByLine[lines.length - 1] = [];
        
      } else {
        
        lines[lines.length - 1].width += width;
      }
      
      segBoxesByLine[lines.length - 1].push(segBox);
      
      if (j === 0) {
        
        segRanges[i].startLine = lines.length - 1;
        segRanges[i].startLeft = left;
      }
      
      if (j === rects.length - 1) {
        
        segRanges[i].endLine = lines.length - 1;
        segRanges[i].endRight = right;
      }
    }
  }
  
  function isNewLine(top) {
    
    if (lines.length === 0 || lines[lines.length - 1].top !== top) {
      
      return true;
    }
  }
}

function makeSpotlightBoxes() {
  
  var fragment = document.createDocumentFragment(); // Needed?
  var box;
  
  for (i = 0; i < lines.length; i++) {
    
    box = document.createElement('div');
    box.classList.add('spotlight-box');
    box.style.top = lines[i].top + 'px';
    fragment.appendChild(box);
    spotlightBoxes.push(box);
  }
  
  spotlightPane.appendChild(fragment);
}

//

function moveSpotlight(range) {
  
  var startLine = range.startLine;
  var endLine = range.endLine;
  var startLeft = range.startLeft;
  var endRight = range.endRight;
  
  var line;
  var left;
  var width;
  
  clearSpotlight();
  
  for (var i = endLine; i >= startLine; i--) {
    
    line = lines[i];
    left = line.left;
    width = line.width;
    
    if (i === endLine) {
      width = endRight;
    }
    
    if (i === startLine) {
      left = startLeft;
      width -= startLeft;
    }
    
    spotlightBoxes[i].style.left = left + 'px';
    spotlightBoxes[i].style.width = width + 'px';
  }
  
  function clearSpotlight() {
    
    for (var i = 0; i < spotlightBoxes.length; i++) {
      
      spotlightBoxes[i].style.left = '0px';
      spotlightBoxes[i].style.width = '0px';
    }
  }
}

// Event handlers

function handleClick(e) {
  
  var x = e.pageX - textPane.getBoundingClientRect().left; //
  var y = e.pageY - textPaneTop; //
  
  var line;
  var segBox;
  
  for (var i = 0; i < lines.length; i++) {
    
    line = lines[i];
    
    if (isInLine(y, line)) {
      
      for (var j = 0; j < segBoxesByLine[i].length; j++) {
        
        segBox = segBoxesByLine[i][j];
        
        if (isInSegBox(x, segBox)) {
          
          moveSpotlight(segRanges[segBox.segIndex]);
          return;
        }
      }
    } 
  }
  
  function isInLine(y, line) {

    if (line.top <= y && y < line.top + 44) {

      return true;
    }
  }
  
  function isInSegBox(x, segBox) {

    if (segBox.left <= x && x < segBox.right) {

      return true;
    }
  }
}

// Event listeners

textPane.addEventListener('click', handleClick, false);

//

getBounds();
makeSpotlightBoxes();

/*var t0 = performance.now();
var t1 = performance.now();
console.log(t1 - t0);*/
