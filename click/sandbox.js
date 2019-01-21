var textPane = document.getElementById('text-pane');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));
var nSegs = segs.length;

var segBoxesByLine = [];

var segBoxPadX = 3.5; //
var segBoxPadY = 5.5; //

var lineHeight = 44;

var textPaneTop = 22; //

//

function clearSpotlight() {
  for (var i = 0; i < spotlightBoxes.length; i++) {
    spotlightBoxes[i].style.left = '0px';
    spotlightBoxes[i].style.width = '0px';
  }
}

// makeSpotlight() placeSpotlight() putSpotlight()

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
}

// Testing

var spotlightBoxes = [];
spotlightBoxes.push.apply(spotlightBoxes, document.getElementsByClassName('spotlight-box'));

(function () { //
  spotlightBoxes[1].style.top = '66px';
  spotlightBoxes[2].style.top = '110px';
})();

var segBoxesByLine = [
  [{left: 0, right: 215, segIndex: 0}],
  [{left: 0, right: 155, segIndex: 1},
  {left: 155, right: 342, segIndex: 2},
  {left: 342, right: 445, segIndex: 3},
  {left: 445, right: 480, segIndex: 4}],
  [{left: 0, right: 85, segIndex: 4}]
];

var lines = [
  {top: 0, left: 0, width: 215},
  {top: 66, left: 0, width: 480},
  {top: 110, left: 0, width: 85}
];

var segRanges = [
  {startLine: 0, endLine: 0, startLeft: 0, endRight: 215},
  {startLine: 1, endLine: 1, startLeft: 0, endRight: 155},
  {startLine: 1, endLine: 1, startLeft: 155, endRight: 342},
  {startLine: 1, endLine: 1, startLeft: 342, endRight: 445},
  {startLine: 1, endLine: 2, startLeft: 445, endRight: 85}
]

/*function test() { //
  
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  
  var textPaneRect = textPane.getBoundingClientRect();
  var textPaneTop = textPaneRect.top;
  var textPaneLeft = textPaneRect.left;
  
  var xOffset = scrollLeft - textPaneLeft;
  var yOffset = scrollTop - textPaneTop;
  
  var top;
  var left;
  var width;
  
  var theseRects;
  
  for (var i = 0; i < nSegs; i++) {
    
    segBoxesByLine[i] = [];
    theseRects = segs[i].getClientRects();
    
    for (var j = 0; j < theseRects.length; j++) {
      
      top = theseRects[j].top + yOffset - segBoxPadY;
      left = theseRects[j].left + xOffset - segBoxPadX;
      right = theseRects[j].right + xOffset + segBoxPadX;
      
      segBoxesByLine[i][j] = {
        top: top,
        left: left,
        right: right
      }
    }
  }
}*/

// Helper functions

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
}

/*function handleClick(e) {
  
  var clientX = e.clientX; //
  var clientY = e.clientY; //
  var pageX = e.pageX; //
  var pageY = e.pageY; //
  var offsetX = e.offsetX; //
  var offsetY = e.offsetY; //
  
  console.log(clientX, clientY); //
  console.log(pageX, pageY); //
  console.log(offsetX, offsetY); //
  console.log(e.target); //
}*/

// Event listeners

textPane.addEventListener('click', handleClick, false);
