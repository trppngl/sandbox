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

//

var audio = document.getElementById('audio');

var audioTimer;

var playAll = false;

var currentIndex = -1;

//

var pressedKeys = {
  left: false,
  right: false
};

var keyMap = {
  37: 'left',
  39: 'right'
};

var nextTime = 0;
var keydownDelay = 125;

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
    
    segRanges[i] = {};
    
    for (var j = 0; j < nRects; j++) {
      
      rect = rects[j];
      textXY = getTextXY(rect.left, rect.top);
      top = textXY.y - segBoxPadY;
      left = textXY.x - segBoxPadX;
      width = rect.width + segBoxPadX * 2;
      
      if (j !== nRects - 1) {
        
        width += extensionWidth;
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
        
        segRanges[i].startLine = currentLine;
        segRanges[i].startLeft = left;
      }
      
      if (j === nRects - 1) {
        
        segRanges[i].endLine = currentLine;
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

// Move spotlight

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

// Audio navigation

function playAudio() {
  
  audio.play();
  audioTimer = window.setInterval(checkStop, 20);
}

function pauseAudio() {
  
  audio.pause();
  window.clearInterval(audioTimer);
}

function checkStop() { //
  
  if (audio.currentTime > times[currentIndex][1] && (!playAll || currentIndex === nSegs - 1)) {
    
    pauseAudio();
    playAll = false;
    
  } else if (currentIndex < nSegs - 1 && audio.currentTime > times[currentIndex + 1][0]) {
    
    playSeg(currentIndex + 1);
  }
}

function togglePlayAll() {
  
  if (audio.paused) {
    
    playAll = true;
    next();
    
  } else {
    
    playAll = !playAll;
  }
}

function next() {
  
  if (currentIndex < nSegs - 1) {
    
    playSeg(currentIndex + 1, 'keydown');
  }
}

// Below repeats very beginning of audio when holding down prev

function prev() { //
  
  var threshold = times[currentIndex][0] + 0.25;
  
  if (audio.currentTime > threshold) {
    
    playSeg(currentIndex, 'keydown');
    
  } else if (currentIndex > 0) {
    
    playSeg(currentIndex - 1, 'keydown');
    
  } else {
    
    playSeg(currentIndex, 'keydown'); // But handle spotlight differently?
  }
}

function playSeg(targetIndex, userAction) {
  
  currentIndex = targetIndex;
  
  if (userAction) {
    
    audio.currentTime = times[currentIndex][0];
  }
  
  if (audio.paused) {
    
    playAudio();
  }
  
  moveSpotlight(segRanges[currentIndex]); // Temp, will depend
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

// Animation

function loop(timestamp) {
  
  requestAnimationFrame(loop);
  
  if (pressedKeys.left) {
    
    console.log('left');
  }
  
  if (pressedKeys.right) {
    
    console.log(currentIndex, timestamp);
    
    if (timestamp > nextTime) {
      
      next();
      nextTime = timestamp + keydownDelay;
    }
  }
}

// Event handlers

function handleClick(e) {
  
  var textXY = getTextXY(e.clientX, e.clientY); //
  var x = textXY.x;
  var y = textXY.y;
  
  var line;
  var segBox;
  
  for (var i = 0; i < lines.length; i++) {
    
    line = lines[i];
    
    if (isInLine(y, line)) {
      
      for (var j = 0; j < segBoxesByLine[i].length; j++) {
        
        segBox = segBoxesByLine[i][j];
        
        if (isInSegBox(x, segBox)) {
          
          playSeg(segBox.segIndex, 'click');
          return;
        }
      }
    } 
  }
  
  function isInLine(y, line) {

    if (line.top <= y && y < line.top + lineHeight) {

      return true;
    }
  }
  
  function isInSegBox(x, segBox) {

    if (segBox.left <= x && x < segBox.right) {

      return true;
    }
  }
}

/*function handleKeydown(e) {
  switch(e.keyCode) {
    case 32:
      e.preventDefault();
      togglePlayAll();
      break;
    case 37:
      e.preventDefault();
      prev();
      break;
    case 39:
      e.preventDefault();
      next();
      break;
  }
}*/

function handleKeydown(e) {
  
  var key = keyMap[e.keyCode]
  pressedKeys[key] = true
}

function handleKeyup(e) {
  
  var key = keyMap[e.keyCode]
  pressedKeys[key] = false
}

// Event listeners

textPane.addEventListener('click', handleClick, false);
document.addEventListener('keydown', handleKeydown, false);
document.addEventListener('keyup', handleKeyup, false);

//

getPositions();
makeSpotlightBoxes();
requestAnimationFrame(loop);

/*var t0 = performance.now();
var t1 = performance.now();
console.log(t1 - t0);*/

// Separate audio and spotlight in playSeg() and elsewhere?

// Get rid of delay when holding key down 

// When holding prev and reaching first seg, play upon reaching instead of upon keyup?

// Handle spacebar differently? Maybe only keyup?
