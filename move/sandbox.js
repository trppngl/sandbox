var textPane = document.getElementById('text-pane');
var spotlightPane = document.getElementById('spotlight-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var nSegs = segs.length;

var lines = [];
var segBoxesByLine = [];
var segRanges = [];
var spotlightBoxes = [];

var SEG_BOX_PAD_X = 3.5; //
var SEG_BOX_PAD_Y = 5.5; //
var LINE_HEIGHT = 44;
var EXTENSION_WIDTH = 7;

var spotlight = {
  
  start: new SpotlightEdge(),
  end: new SpotlightEdge()
}

// Init

// getData() getPositions() crawlRects() getBounds() getBoxes()

function getPositions() {
  
  var rects;
  var nRects;
  var rect;
  
  var top;
  var left;
  var width;
  var right;
  
  var textXY;
  
  var currentLine = -1;
  
  for (var i = 0; i < nSegs; i++) {
    
    rects = segs[i].getClientRects();
    nRects = rects.length;
    
    segRanges[i] = new LineRange;
    
    for (var j = 0; j < nRects; j++) {
      
      rect = rects[j];
      textXY = getTextXY(rect.left, rect.top);
      top = textXY.y - SEG_BOX_PAD_Y;
      left = textXY.x - SEG_BOX_PAD_X;
      width = rect.width + SEG_BOX_PAD_X * 2;
      
      if (j !== nRects - 1) {
        
        width += EXTENSION_WIDTH;
      }
      
      right = left + width;
      
      if (isNewLine(top)) {
        
        currentLine++;
        
        lines[currentLine] = {
          top: top,
          left: left,
          width: width
        };
        
        segBoxesByLine[currentLine] = [];
        
      } else {
        
        lines[currentLine].width += width;
      }
      
      segBoxesByLine[currentLine].push({
        left: left,
        right: left + width,
        segIndex: i
      });
      
      if (j === 0) {
        
        segRanges[i].start.line = currentLine;
        segRanges[i].start.x = left;
      }
      
      if (j === nRects - 1) {
        
        segRanges[i].end.line = currentLine;
        segRanges[i].end.x = right;
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

// TESTING

function LineRange() { // Rename?
  
  this.start = new LineRangeEdge;
  this.end = new LineRangeEdge;
}

function LineRangeEdge() { // Rename?
  
  this.line = 0;
  this.x = 0;
}

function SpotlightEdge() {
  
  this.line = 0,
  this.x = 0
}

SpotlightEdge.prototype.shift = function(increment) { //
  
  this.x += increment;
}

// Move spotlight

// moveSpotlight() shiftSpotlight() repositionSpotlight()

function repositionSpotlight(range) {
  
  spotlight.start.line = range.start.line;
  spotlight.end.line = range.end.line;
  spotlight.start.x = range.start.x;
  spotlight.end.x = range.end.x;
}

function paintSpotlight() {
  
  var startLine = spotlight.start.line;
  var endLine = spotlight.end.line;
  var startX = spotlight.start.x;
  var endX = spotlight.end.x;
  
  var line;
  var left;
  var width;
  
  clearSpotlight();
  
  for (var i = endLine; i >= startLine; i--) {
    
    line = lines[i];
    left = line.left;
    width = line.width;
    
    if (i === endLine) {
      
      width = endX;
    }
    
    if (i === startLine) {
      
      left = startX;
      width -= startX;
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

// Helpers

function getTextXY(x, y) {
  
  var rect = textPane.getBoundingClientRect();
  var left = rect.left;
  var top = rect.top;
  
  return {
    
    x: x - left,
    y: y - top
  }
}

// Event handlers

function handleClick(e) {
  
  var clickPos = getTextXY(e.clientX, e.clientY); //
  var x = clickPos.x; //
  var y = clickPos.y; //
  
  var line;
  var segBox;
  
  for (var i = 0; i < lines.length; i++) {
    
    line = lines[i];
    
    if (isInLine(y, line)) {
      
      for (var j = 0; j < segBoxesByLine[i].length; j++) {
        
        segBox = segBoxesByLine[i][j];
        
        if (isInSegBox(x, segBox)) {
          
          repositionSpotlight(segRanges[segBox.segIndex]);
          paintSpotlight();
          return;
        }
      }
    } 
  }
  
  function isInLine(y, line) {

    if (line.top <= y && y < line.top + LINE_HEIGHT) {

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

getPositions();
makeSpotlightBoxes();

/*var t0 = performance.now();
var t1 = performance.now();
console.log(t1 - t0);*/
