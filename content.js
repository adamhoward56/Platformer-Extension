var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var onPlatform = false;
var player;
var controller;
var interval;

function createCanvas(){
	if (document.getElementById("extensionGameCanvas") == null) {
		detectPlatforms();
		restrictKeys = true;
		player = new buildPlayer(30,60, "red", viewWidth/2, window.pageYOffset);
		controller = new buildController(deadZoneX*2, deadZoneY*2, "#00000066", 0, 0);
		gameSpace.start();
		interval = setInterval(updateFrame, 20);

	} else {
		c = document.getElementById("extensionGameCanvas");
		c.parentNode.removeChild(c);
		restrictKeys = false;
		clearInterval(interval);
		player = null;
	}
}

var gameSpace = {
	canvas : document.createElement("canvas"),
	start : function() {
		this.canvas.style.position = "absolute";
		this.canvas.style.zIndex = "999999";
		this.canvas.style.top = "0";
		this.canvas.style.left = "0";
		this.canvas.style.pointerEvents = "none";

		this.canvas.width = document.body.scrollWidth;
		this.canvas.height = document.body.scrollHeight;
		this.context = this.canvas.getContext('2d');
		this.context.fillStyle = 'rgba(0,0,0,0.0)';
		this.context.fillRect(0,0,window.innerWidth, window.innerHeight);

		this.canvas.setAttribute("id", "extensionGameCanvas");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
	},

	update : function() {
		var canvas = document.getElementById("extensionGameCanvas");
		//canvas.width = document.body.scrollWidth;
		//canvas.height = document.body.scrollHeight;
	},

	clear : function() {
		this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = 'rgba(0,0,0,0.0)';
		this.context.fillRect(0,0,window.innerWidth, window.innerHeight);
	}
}

function buildPlatform(width, height, color, x, y) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.update = function() {
		ctx = gameSpace.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

function buildController(width, height, color, x, y) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.hidden = true;

	this.setVisible = function(b) {
		this.hidden = !b;
	}

	this.update = function() {
		if (this.hidden) return;
		ctx = gameSpace.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

function buildPlayer(width, height, color, x, y){
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.velX = 0;
	this.velY = 0;
	this.falling = true;

	this.update = function() {
		ctx = gameSpace.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.updatePos = function() {
		// Vertical Positioning 
		if (this.y + this.height < document.body.scrollHeight && !onPlatform){
			this.falling = true;
		} else if (this.y + this.height == document.body.scrollHeight){

		} else {
			this.falling = false;
			if (!onPlatform){
				this.y = document.body.scrollHeight - this.height;
			}
		}

		if (this.falling && this.velY < 40) {
			this.velY += 0.56;
		} else if (!this.falling) {
			this.velY = 0;
		}

		// Horizontal Positioning
		if (this.x + this.width < -5) {
			this.x = viewWidth + this.width;
		}

		if (this.x > viewWidth + this.width + 5) {
			this.x = -2-this.width;
		}

		this.x += this.velX;
		this.y += this.velY;
	}
}

var previousYLoc = window.pageYOffset;
var canScroll = false;
var easeSpeed = 10; // Larger values = slower scrolling
function easeView() {
	if (player.y - window.pageYOffset - viewHeight/2 > 0) {
		return window.pageYOffset + (player.y - window.pageYOffset - viewHeight/2)/easeSpeed;
	} else if (player.y - window.pageYOffset - viewHeight/2 < 0) {
		return window.pageYOffset + (player.y - window.pageYOffset - viewHeight/2)/easeSpeed;
	} else {
		canScroll = true;
	}
	return window.pageYOffset;
}

function smoothScroll() {
	var s = easeView()

	if ((currentSpeed != 0 || player.velY != 0 || s != window.pageYOffset) && !canScroll){
		window.scrollTo(player.x - viewWidth/2, s);
	}
}

var platforms = [];
function detectPlatforms() {
	var links = document.getElementsByTagName("a");
	var testingList = Array.prototype.slice.call(links);
	platforms = [];

	testingList.forEach(function(element){
		var rect = element.getBoundingClientRect();
		var left = rect.left + window.pageXOffset;
		var top = rect.left + window.pageYofset;

		if (element.offsetParent != null) {
			platforms.push(new buildPlatform(rect.width, rect.height, "rgba(0,0,255,0.2)", left, rect.top + window.pageYOffset));
		}
	});
}

function updatePlatforms() {
	
	var shouldFall = true;
	platforms.forEach(function(p){
		p.update();

		if(player.x < p.x + p.width && player.x + player.width > p.x) {
			if(player.y + player.height < p.y+10 && player.velY >= 0) {
				if (p.y-(player.height+player.y) >= 0 && p.y-(player.height+player.y) < 1+Math.abs(player.velY)) {
					player.velY = 0;
					player.y = p.y-player.height;
					onPlatform = true;
					shouldFall = false;
				}
			} else {
				onPlatform = false;
			}
		}
	});

	falling = shouldFall;
	onPlatform = !shouldFall;
}

function updateFrame() {
	if (window.pageYOffset == previousYLoc) {
		canScroll = true;
	}

	previousYLoc = window.pageYOffset;

	if (player.velY != 0 || player.velX != 0) {
		canScroll = false;
	}

	gameSpace.clear();
	updatePlatforms();
	detectPlatforms();
	controller.update();
	player.updatePos();
	player.update();
	smoothScroll();
	accelerate();
}

function disable_arrow_keys(e) {
	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		if (restrictKeys) {
			e.preventDefault();
		}
	}
}

var leftPress = false;
var rightPress = false;
var maxSpeed = 8.5;
var accelerationRate = 1.8;
var decelerationRate = 1.2;
var currentSpeed = 0;

function accelerate(){
	if (leftPress && !rightPress) {
		if (currentSpeed > -maxSpeed) {
			currentSpeed -= accelerationRate;
		}

	} else if (rightPress && !leftPress) {
		if (currentSpeed < maxSpeed) {
			currentSpeed += accelerationRate;
		}
	} else {
		if (Math.abs(currentSpeed) > 1) {
			currentSpeed -= (Math.abs(currentSpeed)/currentSpeed) * decelerationRate;
		} else {
			currentSpeed = 0;
		}
	}

	player.velX = currentSpeed;
}

var map = {};
onkeydown = onkeyup = function(e){
    map[e.keyCode] = e.type == 'keydown';
	
	console.log(e.keyCode);

    // Keydown Left & Right Arrows
	if (map[37]) {
		leftPress = true;
		canScroll = false;
	}
	if (map[39]) {
		rightPress = true;
		canScroll = false;
	}

	// Keyup Left & Right Arrows
	if (!map[37]) {
		leftPress = false;
	}
	
	if (!map[39]) {
		rightPress = false;
	}

	// Jump
	if ((map[32] || map[38])) {
		jump();
	}

	// Drop through platform
	if (map[40]) drop();
}

function jump() {
	if (!player.falling) {
		player.falling = true;
		player.y -= 1;
		player.velY -= 12;
		canScroll = false;
	}
}

function drop() {
	if (!player.falling) {
		player.y += 1;
	}
}

var restrictKeys = false;
//window.addEventListener("resize", gameSpace.update, false);
window.addEventListener("keydown", disable_arrow_keys, false);

// Touch events
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
document.body.addEventListener("touchend", function(e) {
	if (e.targetTouches.length == 0) {
		rightPress = leftPress = false;
		controller.setVisible(false);
	}
	xDown = yDown = null;
});

var xDown = null;
var yDown = null;

function handleTouchStart(e) {
    const firstTouch = e.targetTouches[0];
    xDown = firstTouch.clientX;
	yDown = firstTouch.clientY;
};

var deadZoneX = 60;
var deadZoneY = 35;

function handleTouchMove(e) {
	if (!xDown || !yDown) return;
	e.preventDefault();
	
    var xUp = e.targetTouches[0].clientX;
    var yUp = e.targetTouches[0].clientY;
    var xDiff = xDown - xUp;
	var yDiff = yDown - yUp;

	if (xDiff > deadZoneX) leftPress = true, rightPress = false;
	else if (xDiff < -deadZoneX) leftPress = false, rightPress = true;
	else leftPress = rightPress = false;

	if (yDiff > deadZoneY) jump();
	else if (yDiff < -deadZoneY) drop();

	controller.x = xDown - deadZoneX;
	controller.y = window.pageYOffset + yDown;
	controller.setVisible(true);
};

createCanvas();