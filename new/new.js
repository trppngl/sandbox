var context, controller, rect, loop;

context = document.querySelector("canvas").getContext("2d");

var canvasWidth = 650;
var canvasHeight = 484;
var rectWidth = 150;
var rectHeight = 44;

var acceleration = 8.5;
var friction = 0.75;

// 3 0.9
// 5 0.8
// 8.5 0.75
// 10 0.75
// 10 0.7

context.canvas.height = canvasHeight;
context.canvas.width = canvasWidth;

rect = {
  width: rectWidth,
  height: rectHeight,
  x: -rectWidth,
  x_velocity: 0,
  y: 0,
};

loop = function() {
  
  if (controller.left) {

    rect.x_velocity -= acceleration;
  }

  if (controller.right) {

    rect.x_velocity += acceleration;
  }

  rect.x += rect.x_velocity;
  rect.x_velocity *= friction;

  if (rect.x < -rectWidth) {

    rect.x = canvasWidth;
    rect.y -= 44;

  } else if (rect.x > canvasWidth) {

    rect.x = -rectWidth;
    rect.y += 44;

  }

  context.fillStyle = "rgb(243, 242, 246)";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = "white";
  
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.fill();

  window.requestAnimationFrame(loop);

};

controller = {

  left:false,
  right:false,
  keyListener:function(event) {

    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {

      case 37:
        controller.left = key_state;
        break;
        
      case 39:
        controller.right = key_state;
        break;
    }
  }
};

//

window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);

//

window.requestAnimationFrame(loop);
