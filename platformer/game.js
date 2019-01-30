function Game() {
  var canvas = this.getCanvas();

  this.mouseX = this.mouseY = 0;
  this.gridX = this.gridY = -1;
  this.gridWall = true;

  this.jumpDown = false;
  this.leftDown = false;
  this.rightDown = false;

  // Create a grid with a floor over its entire width
  this.grid = new PlatformerGrid(
    Math.floor(canvas.width / this.GRID_RESOLUTION),
    Math.floor(canvas.height / this.GRID_RESOLUTION),
    this.GRID_RESOLUTION);

  for(var x = 0; x < this.grid.width; ++x)
    this.grid.setCeiling(x, this.grid.height - 1, true);

  // Create a player
  this.player = new PlatformerNode(
    this.PLAYER_SPAWN_X,
    this.PLAYER_SPAWN_Y,
    this.PLAYER_WIDTH,
    this.PLAYER_HEIGHT);
  this.grid.addNode(this.player);

  this.addListeners();
};

Game.prototype = {
  GRID_RESOLUTION: 44,
  PLAYER_WIDTH: 440,
  PLAYER_HEIGHT: 44,
  PAINT_STROKE_STYLE: "lime",
  ERASE_STROKE_STYLE: "red",
  PLAYER_WALK_SPEED: 1000,
  PLAYER_WALK_ACCELERATION: 15000,
  PLAYER_SPAWN_X: 200,
  PLAYER_SPAWN_Y: 0,
  KEY_LEFT: 37,
  KEY_RIGHT: 39,

  addListeners() {
    window.addEventListener("keydown", this.keyDown.bind(this));
    window.addEventListener("keyup", this.keyUp.bind(this));
  },

  getCanvas() {
    return document.getElementById("renderer");
  },

  run() {
    this.lastTime = new Date();

    window.requestAnimationFrame(this.animate.bind(this));
  },

  keyDown(e) {
    switch(e.keyCode) {
      case this.KEY_RIGHT:
        this.rightDown = true;
        break;
      case this.KEY_LEFT:
        this.leftDown = true;
        break;
    }
  },

  keyUp(e) {
    switch(e.keyCode) {
      case this.KEY_RIGHT:
        this.rightDown = false;
        break;
      case this.KEY_LEFT:
        this.leftDown = false;
        break;
    }
  },

  findSelectedEdge() {
    const deltaX = this.mouseX - this.gridX * this.GRID_RESOLUTION;
    const deltaY = this.mouseY - this.gridY * this.GRID_RESOLUTION;
    this.gridWall = deltaX * deltaX < deltaY * deltaY;

    if(deltaX + deltaY > this.GRID_RESOLUTION) {
      if(deltaX > deltaY) {
        this.gridX = Math.min(this.gridX + 1, this.grid.width);
      }
      else {
        this.gridY = Math.min(this.gridY + 1, this.grid.height);
      }

      this.gridWall = !this.gridWall;
    }
  },

  animate() {
    var time = new Date();
    var timeStep = (time.getMilliseconds() - this.lastTime.getMilliseconds()) / 1000;
    if(timeStep < 0)
      timeStep += 1;

    this.lastTime = time;

    this.movePlayer(timeStep);
    this.grid.update(timeStep);
    this.render(timeStep);

    window.requestAnimationFrame(this.animate.bind(this));
  },

  movePlayer(timeStep) {
    if(this.rightDown) {
      this.player.setvx(Math.min(this.player.vx + this.PLAYER_WALK_ACCELERATION * timeStep, this.PLAYER_WALK_SPEED));
    }

    if(this.leftDown) {
      this.player.setvx(Math.max(this.player.vx - this.PLAYER_WALK_ACCELERATION * timeStep, -this.PLAYER_WALK_SPEED));
    }

    if(
      this.player.x < -this.player.width ||
      this.player.y < -this.player.height ||
      this.player.x > this.getCanvas().width ||
      this.player.y > this.getCanvas().height) {
      this.player.x = this.PLAYER_SPAWN_X;
      this.player.y = this.PLAYER_SPAWN_Y;
    }
  },

  render(timeStep) {
    var canvas = this.getCanvas();
    var context = canvas.getContext("2d");

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgb(243, 242, 246)";
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();

    this.grid.draw(context);

    // Draw selected edge
    if(this.gridX != -1 && this.gridY != -1) {
      context.beginPath();
      context.lineWidth = PlatformerGrid.prototype.EDGE_LINE_WIDTH;

      if(this.gridWall) {
        if(this.grid.getWall(this.gridX, this.gridY))
          context.strokeStyle = this.ERASE_STROKE_STYLE;
        else
          context.strokeStyle = this.PAINT_STROKE_STYLE;

        context.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        context.lineTo(this.gridX * this.GRID_RESOLUTION, (this.gridY + 1) * this.GRID_RESOLUTION);
      }
      else {
        if(this.grid.getCeiling(this.gridX, this.gridY))
          context.strokeStyle = this.ERASE_STROKE_STYLE;
        else
          context.strokeStyle = this.PAINT_STROKE_STYLE;

        context.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        context.lineTo((this.gridX + 1) * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
      }

      context.stroke();
    }
  }
};
