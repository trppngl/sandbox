var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width
var height

var resize = function() {
  width = window.innerWidth * 2
  height = window.innerHeight * 2
  canvas.width = width
  canvas.height = height
}
window.onresize = resize
resize()

ctx.fillStyle = 'red'

var state = {
  x: (width / 2),
  y: (height / 2),
  pressedKeys: {
    left: false,
    right: false
  }
}

function update(progress) {
  if (state.pressedKeys.left) {
    state.x -= progress
  }
  if (state.pressedKeys.right) {
    state.x += progress
  }

  if (state.x > width) {
    state.x -= width
  }
  else if (state.x < 0) {
    state.x += width
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height)

  ctx.fillRect(state.x - 10, state.y - 10, 20, 20)
}

function loop(timestamp) {
  var progress = timestamp - lastRender

  update(progress)
  draw()
  
  lastRender = timestamp
  window.requestAnimationFrame(loop)
}

var lastRender = 0
window.requestAnimationFrame(loop)

var keyMap = {
  37: 'left',
  39: 'right'
}

function handleKeydown(e) {
  
  var key = keyMap[e.keyCode]
  state.pressedKeys[key] = true
}

function handleKeyup(e) {
  
  var key = keyMap[e.keyCode]
  state.pressedKeys[key] = false
}

window.addEventListener("keydown", handleKeydown, false)
window.addEventListener("keyup", handleKeyup, false)
