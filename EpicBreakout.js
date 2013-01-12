/* Javascript version of Breakout with multiple levels and power-ups
 * Note: uses several custom objects from www.CodeHS.com not included here.
 * 
 * Playable at: www.thenickhuber.com/epicbreakout.html
 * 
 * TO DO (ordered)
 * 
 * The Brick King
 * indestructible bricks
 * Shield Upgrade
 * extra life
 * minion bricks
 * nuke
 * soundtrack, sound effects
 *
 *
 * indestructible bricks
	if(level == 4){
		drawMessage("ALERT_MESSAGE", "GRAY BRICKS are indestructible",
					ALERT_MESSAGE_FONT);
		for(h = 0; h < NUM_BRICKS_PER_ROW; h+=2){
			bricks[(NUM_ROWS - 1)* NUM_BRICKS_PER_ROW + h].type = "indestructible";	
			bricks[(NUM_ROWS - 1)* NUM_BRICKS_PER_ROW + h].setColor(Color.gray);
			add(bricks[(NUM_ROWS - 1)* NUM_BRICKS_PER_ROW + h]);	
		}
	}
 *
 *
 */

/* World graphical constants */
var BRICK_TOP_OFFSET = 40;
var SCORE_TOP_OFFSET = 5;
var SCORE_SIDE_OFFSET = 7;
var BRICK_SPACING = 3.5;
var PADDLE_OFFSET = 10;

/* Level 1 values */
var NUM_ROWS = 5;
var NUM_BRICKS_PER_ROW = 5;
var BRICK_HEIGHT = 25;
var BRICK_WIDTH = (getWidth() - (NUM_BRICKS_PER_ROW + 1) * BRICK_SPACING) / NUM_BRICKS_PER_ROW;
var PADDLE_WIDTH = 120;
var PADDLE_HEIGHT = 10;
var POWER_STRIP_WIDTH = (1/8) * PADDLE_WIDTH;
var BALL_RADIUS = 15;
var BULLET_RADIUS = 5;
var BULLET_SPEED = 8;
var LASER_HEIGHT = 50;
var LASER_WIDTH = 1;
var LASER_SPEED = 16;
var PADDLE_SPEED = 8;

/* Brick colors */
var COLOR_ARRAY = ["#E0191F", "#F016D3", "#910EE8", "#3925E8", "#29CAF2", "#1DF22B", "#A9F218", "#F2F23F"];

/* PowerUp constants */
var BULLET_COLOR = "#DA24FF";
var LASER_COLOR = "#17BEE8";
var NUMBER_OF_POWERUPS = 2;

/* Motion variables */
var paused = true;
var paddleLeft = false;
var paddleRight = false;
var powerUpOn = false;
var DELAY = 1;
var WINCHECK_DELAY = 25 * DELAY;
var LASER_DELAY = 15 * DELAY;
var dx = 5;
var dy = 5;

/* User stats, level scaling */
var STARTING_LIVES = 3;
var POINTS_PER_BRICK = 1;
var level = 1;
var EXTRA_ROWS_PER_LEVEL = 1;
var EXTRA_ROW_LENGTH_PER_LEVEL = 1;
var lives = STARTING_LIVES;
var trueDeath = false;
var score = 0;
var passingScore = NUM_ROWS * NUM_BRICKS_PER_ROW * POINTS_PER_BRICK;
var lifeCounter;
var scoreCounter;
var xScaling;
var yScaling;

/* Global game objects */
var bricks = [];
var ball;
var paddle;
var bullet;
var lasers = [];
var laserDelay = 0;
var currentPowerUp = 0;
var powerUpsUnlocked = 0;
var powerStrip;

/* Message globals */
var messages = {}
var LEVEL_MESSAGE_FONT = "24pt Georgia";
var PAUSE_MESSAGE_FONT = "16pt Georgia";
var ALERT_MESSAGE_FONT = "16pt Georgia";
var DEATH_MESSAGE_FONT = "46pt Georgia";
var DEATH_MESSAGE2_FONT = "22pt Georgia";
var DEATH_MESSAGE3_FONT = "22pt Georgia";
var DEATH_MESSAGE4_FONT = "26pt Georgia";
var PAUSE_MESSAGE_COLOR = "#696969";
var ALERT_MESSAGE_COLOR = "#EB0505";
var DEATH_MESSAGE2_COLOR = "#ED1A1A";
var DEATH_MESSAGE3_COLOR = "#ED1A1A";
var DEATH_MESSAGE4_COLOR = "#70E83C";
var MESSAGE_OFFSET = 60;

function start(){
		
	drawWorld();
	
	keyDownMethod(keydown);
	keyUpMethod(keyup);

	setTimer(moveBall, DELAY);
	setTimer(movePaddle, DELAY);
	setTimer(moveLasers, DELAY);
	setTimer(drawPowerUp, DELAY);
	setTimer(checkWin, WINCHECK_DELAY);
	
}

/* Resets all relevant global variables, scales the world (i.e. "zooms out") and
 * redraws it. */
function nextLevel(){
	level++;
	paused = true;
	removeAll();
	lasers = [];
	bricks = [];
	dy = Math.abs(dy);
	dx = Math.abs(dx);
	bullet = null;
	stopTimer(moveBullet);
	
	xScaling = (NUM_BRICKS_PER_ROW + EXTRA_ROW_LENGTH_PER_LEVEL) / NUM_BRICKS_PER_ROW;
	yScaling = (NUM_ROWS + EXTRA_ROWS_PER_LEVEL) / NUM_ROWS;
	
	NUM_ROWS += EXTRA_ROWS_PER_LEVEL;
	NUM_BRICKS_PER_ROW += EXTRA_ROW_LENGTH_PER_LEVEL;
	
	passingScore += NUM_ROWS * NUM_BRICKS_PER_ROW * POINTS_PER_BRICK;
	
	scaleWorld();
	drawWorld();
}

// 0 -- DEATH AND LEVEL UP FUNCTIONS

function death(){
	ball.setPosition(getWidth()/2, getHeight()/2);
	paused = true;
	paddle.setPosition(getWidth()/2 - PADDLE_WIDTH / 2, getHeight() - PADDLE_HEIGHT - PADDLE_OFFSET);
	lives--;
	updateLifeCounter();
	
	remove(bullet);
	bullet = null;
	stopTimer(moveBullet);
	remove(powerStrip);
	for(n = 0; n < lasers.length; n++){
		remove(lasers[n]);	
	}
	lasers = [];
	paddleLeft = false;
	paddleRight = false;
	powerUpOn = false;
	
	dy = Math.abs(dy);
	dx = Math.abs(dx);
	
	drawPowerStrip();
	drawMessage("LEVEL_MESSAGE", "Level: " + level, LEVEL_MESSAGE_FONT);
	drawMessage("PAUSE_MESSAGE", "Hit SPACE to begin", PAUSE_MESSAGE_FONT);
	
	if(lives == -1){
		endGame();
	}		
}

function endGame(){
	trueDeath = true;
	lives = 0;
	removeAll();
	
	stopTimer(checkWin);
	stopTimer(moveLasers);
	stopTimer(movePaddle);
	stopTimer(moveBall);
	ball = null;
	
	drawScore();
	drawPaddle();
	
	messages = {};
	
	drawMessage("DEATH_MESSAGE", "DEATH.", DEATH_MESSAGE_FONT);
	drawMessage("DEATH_MESSAGE2", "The Brick King's evil", DEATH_MESSAGE2_FONT);
	drawMessage("DEATH_MESSAGE3", "continues to ravage the land.", DEATH_MESSAGE3_FONT);
	drawMessage("DEATH_MESSAGE4", "Click RUN to try again!", DEATH_MESSAGE4_FONT);
}

function checkWin(){
	if(score == passingScore){
		paused = true;
		nextLevel();
	}
}

// 1 -- DRAWING FUNCTIONS

/* Draws the different parts of the game interface, including level-specific
 * tips / pointers */
function drawWorld(){
	drawScore();
	drawAllBricks();
	drawBall();
	drawPaddle();
	drawMessage("LEVEL_MESSAGE", "Level: " + level, LEVEL_MESSAGE_FONT);
	drawMessage("PAUSE_MESSAGE", "Hit SPACE to begin", PAUSE_MESSAGE_FONT);
	
	if(level == 1){
		drawMessage("ALERT_MESSAGE", "Hit/hold LEFT/RIGHT to move", ALERT_MESSAGE_FONT);
		drawMessage("ALERT_MESSAGE2", "Hit ESC to pause", ALERT_MESSAGE_FONT);
	}	
	if(level == 2){
		drawMessage("ALERT_MESSAGE", "-- Bullets unlocked --", ALERT_MESSAGE_FONT);
		drawMessage("ALERT_MESSAGE2", "(Hit/hold SPACE to fire/auto-fire)", ALERT_MESSAGE_FONT);
		powerUpsUnlocked++;
		currentPowerUp++;
	}
	if(level == 3){
		drawMessage("ALERT_MESSAGE", "-- Lasers unlocked --", ALERT_MESSAGE_FONT);
		drawMessage("ALERT_MESSAGE2", "(Hit TAB to change weapon)", ALERT_MESSAGE_FONT);
		powerUpsUnlocked++;
	}
	
	drawPowerStrip();
}

/* Scales the appropriate global variables during creation of new level */
function scaleWorld(){
	BRICK_HEIGHT /= yScaling;
	BRICK_WIDTH /= xScaling;
	PADDLE_WIDTH /= xScaling;
	PADDLE_HEIGHT /= yScaling;
	POWER_STRIP_WIDTH /= xScaling;
	BALL_RADIUS /= xScaling;
	BULLET_RADIUS /= xScaling;
	LASER_HEIGHT /= yScaling;
	LASER_WIDTH /= xScaling;	
	PADDLE_SPEED /= xScaling;
	BRICK_SPACING /= xScaling;
	BULLET_SPEED /= yScaling;
	LASER_SPEED /= yScaling;
	dx /= xScaling;
	dy /= yScaling;
}

function drawBall(){
	ball = new Circle(BALL_RADIUS);
	ball.setPosition(getWidth()/2, getHeight()/2);
	add(ball);
	ball.type = "ball";
}

function drawPaddle(){
	paddle = new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT);
	paddle.setPosition(getWidth()/2 - PADDLE_WIDTH/2, getHeight() - PADDLE_HEIGHT - PADDLE_OFFSET);
	add(paddle);
	paddle.type = "paddle";
}

function drawScore(){
	lifeCounter = new Text("Balls left: " + lives, "14pt Georgia");
	lifeCounter.setPosition(SCORE_SIDE_OFFSET, lifeCounter.getHeight() + SCORE_TOP_OFFSET);
	add(lifeCounter);
	lifeCounter.type = "counter";
	
	scoreCounter = new Text("Score: " + score, "14pt Georgia");
	scoreCounter.setPosition(getWidth() - SCORE_SIDE_OFFSET - scoreCounter.getWidth(), scoreCounter.getHeight() + SCORE_TOP_OFFSET);
	add(scoreCounter);
	scoreCounter.type = "counter";
}

function drawPowerStrip(){
	powerStrip = new Rectangle(POWER_STRIP_WIDTH, PADDLE_HEIGHT);
	powerStrip.setPosition(paddle.getX() + PADDLE_WIDTH / 2 - POWER_STRIP_WIDTH / 2, paddle.getY());
	powerStrip.setColor(powerStripColorCheck());
	add(powerStrip);
	powerStrip.type = "paddle";
}

function drawMessage(key, message, font){
	messages[key] = new Text(message.toString(), font);
	
	var x = 0;
	var y = 0;
	var color;
	
	if(key == "LEVEL_MESSAGE"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = getHeight()/2 + MESSAGE_OFFSET;
		color = Color.black;
	}
	if(key == "PAUSE_MESSAGE"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["LEVEL_MESSAGE"].getY() + MESSAGE_OFFSET/2;
		color = PAUSE_MESSAGE_COLOR;
	}
	if(key == "ALERT_MESSAGE"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["PAUSE_MESSAGE"].getY() + MESSAGE_OFFSET;
		color = ALERT_MESSAGE_COLOR;
	}
	if(key == "ALERT_MESSAGE2"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["ALERT_MESSAGE"].getY() + MESSAGE_OFFSET/2;
		color = ALERT_MESSAGE_COLOR;
	}
	if(key == "DEATH_MESSAGE"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = 1.5 * MESSAGE_OFFSET + BRICK_TOP_OFFSET;
		color = Color.black;
	}
	if(key == "DEATH_MESSAGE2"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["DEATH_MESSAGE"].getY() + 1.5 * MESSAGE_OFFSET;
		color = DEATH_MESSAGE3_COLOR;
	}
	if(key == "DEATH_MESSAGE3"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["DEATH_MESSAGE2"].getY() + MESSAGE_OFFSET/2;
		color = DEATH_MESSAGE3_COLOR;
	}
	if(key == "DEATH_MESSAGE4"){
		x = getWidth()/2 - messages[key].getWidth()/2;
		y = messages["DEATH_MESSAGE3"].getY() + 1.5 * MESSAGE_OFFSET;
		color = DEATH_MESSAGE4_COLOR;
	}
	
	messages[key].setPosition(x, y);
	messages[key].setColor(color);
	add(messages[key]);
	messages[key].type = "message";
}

function updateScoreCounter(){
	score += POINTS_PER_BRICK;
	scoreCounter.setText("Score: " + score, "12pt Georgia");
	scoreCounter.setPosition(getWidth() - SCORE_SIDE_OFFSET - scoreCounter.getWidth(), scoreCounter.getHeight() + SCORE_TOP_OFFSET);
}

function updateLifeCounter(){
	lifeCounter.setText("Balls left: " + lives, "12pt Georgia");
	lifeCounter.setPosition(SCORE_SIDE_OFFSET, lifeCounter.getHeight() + SCORE_TOP_OFFSET);
}

// 2 -- MOVEMENT FUNCTIONS

/* Ball callback */
function moveBall(){
	if(!paused){
		checkWalls();
		checkCollisionsBall();
		if(ball != null){
			ball.move(dx, dy);
		}
	}
}

/* Bullet callback */
function moveBullet(){
	bullet.move(0, -BULLET_SPEED);
	checkCollisionsBullet();
}

/* Paddle callback */
function movePaddle(){
	if(!paused){
		if(paddleLeft && paddle.getX() > 0){
			paddle.move(-PADDLE_SPEED, 0);
			powerStrip.move(-PADDLE_SPEED, 0);	
		}
		if(paddleRight && paddle.getX() + PADDLE_WIDTH <= getWidth()){
			paddle.move(PADDLE_SPEED, 0);
			powerStrip.move(PADDLE_SPEED, 0);
		}
	}
}

/* Lasers callback (NOTE: set in start but only executes if lasers array has any 
 * lasers in it */
function moveLasers(){
	if(!paused){
		for(l = 0; l < lasers.length; l++){
			var collision = getElementAt(lasers[l].getX(), lasers[l].getY() - 1);
			if(collision && collision.type == "brick"){
				remove(collision);				
				updateScoreCounter();
				remove(lasers[l]);
				lasers.splice(l,1);	
			}
			else{
				lasers[l].move(0, -LASER_SPEED);
			}
		cleanUpLasers();
		}
	}
}

/* Removes from the canvas and the laser arrays lasers that go above screen */
function cleanUpLasers(){
	for(j = 0; j < lasers.length; j++){
		if(lasers[j].getY() + LASER_HEIGHT <= 0){
			remove(lasers[j]);
			lasers.splice(j,1);
		}
	}	
}

// 3 -- CHECK COLLISION FUNCTIONS

function checkWalls(){
	if(ball.getX() + BALL_RADIUS >= getWidth()){
		dx = -dx;
	}
	if(ball.getX() - BALL_RADIUS <= 0){
		dx = -dx;	
	}
	if(ball.getY() - BALL_RADIUS <= 0){
		dy = -dy;	
	}
	if(ball.getY() + BALL_RADIUS >= getHeight()){
		death();
	}
}

/* Continually run in moveBall() callback.
 * Grabs 8 equidistant points on border of ball and checks if there are bricks
 * at any of these points. If so, calls the ball collision function. */
function checkCollisionsBall(){
	if(ball != null){
		
		var fourtyFiveDegrees = 0.785398163;
		var scaler = BALL_RADIUS * Math.sin(fourtyFiveDegrees);
		
		var borderCoordinates = [];
		
		borderCoordinates[0] = [ball.getX(), ball.getY() - BALL_RADIUS];
		borderCoordinates[1] = [ball.getX() + scaler, ball.getY() - scaler];
		borderCoordinates[2] = [ball.getX() + BALL_RADIUS, ball.getY()];
		borderCoordinates[3] = [ball.getX() + scaler, ball.getY() + scaler];
		borderCoordinates[4] = [ball.getX(), ball.getY() + BALL_RADIUS];
		borderCoordinates[5] = [ball.getX() - scaler, ball.getY() + scaler];
		borderCoordinates[6] = [ball.getX() - BALL_RADIUS, ball.getY()];
		borderCoordinates[7] = [ball.getX() - scaler, ball.getY() - scaler];
		
		for(g = 0; g < borderCoordinates.length; g++){
			var possibleBrick = getElementAt(borderCoordinates[g][0], borderCoordinates[g][1]);
			if(possibleBrick && possibleBrick.type == "brick" || 
			   possibleBrick && possibleBrick.type == "indestructible"){
				collisionBall(possibleBrick);	
			}
			if(possibleBrick && possibleBrick.type == "paddle"){
				dy = -Math.abs(dy);	
			}
		}
	}
}

/* Grabs three points directly in front of bullet and checks if there are any
 * elements at these points. Removes bullets that go above screen */
function checkCollisionsBullet(){
	var collisionCenter = getElementAt(bullet.getX(), bullet.getY() - BULLET_RADIUS - 1);
	var collisionLeft = getElementAt(bullet.getX() - BULLET_RADIUS, bullet.getY() - BULLET_RADIUS - 1);
	var collisionRight = getElementAt(bullet.getX() + BULLET_RADIUS, bullet.getY() - BULLET_RADIUS - 1);
	if(collisionCenter){
		collisionBullet(collisionCenter);
	}
	else if(collisionLeft){
		collisionBullet(collisionLeft);
	}
	else if(collisionRight){
		collisionBullet(collisionRight);
	}
	else if(bullet.getY() + BULLET_RADIUS < 0){
		remove(bullet);	
		bullet = null;
		stopTimer(moveBullet);
	}
}

// 4 -- COLLISION FUNCTIONS

/* Called when the ball has hit a brick. Checks which side of the brick the 
 * ball is on and reflects the ball accordingly. */
function collisionBall(brick){
	if(ball.getX() >= brick.getX() && ball.getX() <= brick.getX() + BRICK_WIDTH){
		dy = -dy;	
	}
	if(ball.getY() >= brick.getY() && ball.getY() <= brick.getY() + 
	   BRICK_HEIGHT){
		dx = -dx;
	}
	if(brick.type != "indestructible"){
		remove(brick);
	}
	updateScoreCounter();	
}

/* Called when a bullet hits an object. Checks if it's a bullet. If it is, it 
 * removes it from the canvas, nulls out the bullet so it can be redrawn and
 * stops the bullet timer */
function collisionBullet(grabbedElement){
	if(grabbedElement.type == "brick"){
		remove(grabbedElement);
		remove(bullet);
		bullet = null;
		stopTimer(moveBullet);
		updateScoreCounter();
	}
}

// 5 -- POWERUP FUNCTIONS

/* Cycles the current powerup and updates the color of the powerstrip. */
function changePowerUp(){
	if(!paused && powerUpsUnlocked >= 2 && !trueDeath){
		currentPowerUp++;
		if(currentPowerUp > NUMBER_OF_POWERUPS){
			currentPowerUp = currentPowerUp % NUMBER_OF_POWERUPS;																
		}
	powerStrip.setColor((powerStripColorCheck()));
	}
}

function powerStripColorCheck(){
	if(currentPowerUp == 1){
		return BULLET_COLOR;
	}
	if(currentPowerUp == 2){
		return LASER_COLOR;	
	}
	else{
		return Color.black;	
	}
}

/* Draws a powerup based on the current powerup. */
function drawPowerUp(){
	if(powerUpOn && currentPowerUp == 1 && powerUpsUnlocked >= 1){
		if(!paused && bullet == null){
			bullet = new Circle(BULLET_RADIUS);
			bullet.setPosition(paddle.getX() + PADDLE_WIDTH / 2, paddle.getY());
			bullet.setColor(BULLET_COLOR);
			add(bullet);
			bullet.type = "bullet";
			setTimer(moveBullet, DELAY);
		}
	}
	if(powerUpOn && currentPowerUp == 2){
		if(!paused && laserDelay >= LASER_DELAY){
			var laser = new Rectangle(LASER_WIDTH, LASER_HEIGHT);
			lasers.push(laser);
			laser.setPosition(paddle.getX() + PADDLE_WIDTH / 2, paddle.getY() - LASER_HEIGHT);
			laser.setColor(LASER_COLOR);
			add(laser);
			laser.type = "laser";
			laserDelay = 0;
		}
		else{
			laserDelay += DELAY;	
		}
	}	
}

// 6 -- USER INPUT HANDLING

/* Note "a" is currently set as a NUKE function to quickly advance in testing */

function keydown(e){
	if(!paused && !trueDeath){
		if(e.keyCode == Keyboard.LEFT){	
			paddleLeft = true;
		}
		if(e.keyCode == Keyboard.RIGHT){
			paddleRight = true;
		}
		if(e.keyCode == 32){
			powerUpOn = true;
		}
		if(e.keyCode == 9){
			changePowerUp();	
		}
		if(e.keyCode == 65){
			removeAllBricks();	
		}
		if(e.keyCode == 27){
			pauser();
		}
	}
	else if (e.keyCode == 32){
			pauser();
		}
}

function keyup(e){
	if(!paused && !trueDeath){
		if(e.keyCode == Keyboard.LEFT){	
			paddleLeft = false;
		}
		if(e.keyCode == Keyboard.RIGHT){
			paddleRight = false;
		}
		if(e.keyCode == 32){
			powerUpOn = false;	
		}
	}
}

function pauser(){
	
	if(!trueDeath){
	
		paused = !paused;
		
		if(Object.keys(messages).length > 0){
			for(i = 0; i < Object.keys(messages).length; i++){
				remove(messages[Object.keys(messages)[i]]);
			}
			messages = {};
		}
		
		if(paused){
			drawMessage("LEVEL_MESSAGE", "PAUSED", LEVEL_MESSAGE_FONT);
			drawMessage("PAUSE_MESSAGE", "Hit SPACE to unpause", PAUSE_MESSAGE_FONT);	
		}
	}
}

// 7 -- BRICK CREATION AND DELETION FUNCTIONS

function drawAllBricks(){
	for(b = 0; b < NUM_ROWS; b++){
		for(k = 0; k < NUM_BRICKS_PER_ROW ; k++){
		drawBrick(chooseColor(b), BRICK_SPACING + k * (BRICK_WIDTH + BRICK_SPACING), BRICK_TOP_OFFSET + b * (BRICK_HEIGHT + BRICK_SPACING));	
		}
	}	
}

function drawBrick(color, x, y){
	bricks.push(new Rectangle(BRICK_WIDTH, BRICK_HEIGHT));
	bricks[bricks.length - 1].setColor(color);
	bricks[bricks.length - 1].setPosition(x, y);
	add(bricks[bricks.length - 1]);
	bricks[bricks.length - 1].type = "brick";
}

function removeAllBricks(){
	for(w = 0; w < NUM_ROWS; w++){
		removeRow(BRICK_TOP_OFFSET + w * (BRICK_HEIGHT + BRICK_SPACING));	
	}
}

function removeRow(yCoord){
	for(u = 0; u < NUM_BRICKS_PER_ROW; u++){
		var object = getElementAt(BRICK_SPACING + u * (BRICK_WIDTH + BRICK_SPACING), yCoord);
		removeBrick(object);
	}
}

function removeBrick(element){
	if(element != null){
		remove(element);
		updateScoreCounter();
	}
}

function chooseColor(rowNumber){
	if(level <= COLOR_ARRAY.length){
		return COLOR_ARRAY[level-1];
	}
	else{
		rowNumber %= COLOR_ARRAY.length;
		return COLOR_ARRAY[rowNumber];
	}
}