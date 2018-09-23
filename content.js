/*var div = document.createElement("div"); 
document.body.appendChild(div); 
div.innerText="Test";*/
var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var onPlatform = false;
var player;
var interval;

function createCanvas(){
	if (document.getElementById("extensionGameCanvas") == null) {
		detectPlatforms();
		restrictKeys = true;
		player = new buildPlayer(30,60, "red", viewWidth/2, window.pageYOffset);
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

	if (!player.falling && (map[32] || map[38])) {
		player.falling = true;
		player.y -= 1;
		player.velY -= 12;
		canScroll = false;
	}
}

var restrictKeys = false;
//window.addEventListener("resize", gameSpace.update, false);
window.addEventListener("keydown", disable_arrow_keys, false);
createCanvas();