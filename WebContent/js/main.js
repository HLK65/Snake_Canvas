//add 0.5 to allow for 1px stroke lines
 
$(document)
		.ready(
				function() {
					myCanvas = $('#canvas')[0];
					ctx = myCanvas.getContext('2d');
					w = $(myCanvas).width();
					h = $(myCanvas).height() || w;

					// Click to restart
					$(myCanvas)
							.on(
									'click',
									function(e) {
										if (deathScreen) {
											if (w / 2 - playAgainMeasures.width
													/ 2 - 25 < e.offsetX
													&& e.offsetX < w
															/ 2
															+ playAgainMeasures.width
															/ 2 + 25) { // 25
												// padding
												if (h / 2 + 30 - 16 - 25 < e.offsetY
														&& e.offsetY < h / 2 + 30 + 25) { // 30
													// is
													// offset
													// of
													// center,
													// 16
													// height
													// of
													// text,
													// 25
													// padding
													startSnake();
												}
											}
										}
										if (startScreen) {
											startSnake();
										}
									});

					// movement control via wasd or arrow keys
					$(document).on(
							'keydown',
							function(e) { // todo overlay instead of document
								var key = e.which;
								if ((key === 65 || key === 37)
										&& direction !== 'right') { // a, arrow
									// left
									nextDirection = 'left';
								} else if ((key === 68 || key === 39)
										&& direction !== 'left') { // d, arrow
									// right
									nextDirection = 'right';
								} else if ((key === 87 || key === 38)
										&& direction !== 'down') { // w, arrow
									// up
									nextDirection = 'up';
								} else if ((key === 83 || key === 40)
										&& direction !== 'up') { // s, arrow
									// down
									nextDirection = 'down';
								} else if (key === 32) { // space
									startSnake();
								} else if (key === 80) { // p for pause
									if (pauseAllowed === true) {
										if (pause === false) {
											clearInterval(loop);
											pause = true;
										} else if (deathScreen === false) {
											startInterval();
											pauseAllowed = false;
										}
									}
								}
							});

					$('#speed').change(function() {
						init()
					});

					init();
				});

// Canvas
var myCanvas, ctx, w, h;

// snake variables
var cellsize = 10, // width and heigth of each cell
direction, // left, right, up, down
nextDirection, // direction for next Timeinvervall
food = {}, // obj with x and y
snake, // array of cells
startLength = 4, speed, deathScreen = false, startScreen = true, loop;

// style
var fontFamily = $('.styleDummy').css('font-Family')
		|| '"Segoe UI", "Open Sans", "Helvetica", "Arial", "sans-serif"', backgroudColor = 'white', snakeColor = 'grey', foodColor = 'red', textColor = $(
		'.background').css('background-color')
		|| '#666';

// text
var playAgain = 'Play again', playAgainMeasures = 1000;

/**
 * init
 */
function init() {
	clearInterval(loop);
	pauseAllowed = true;
	// clear canvas
	ctx.beginPath();
	ctx.fillStyle = backgroudColor || 'white';
	ctx.fillRect(0, 0, w, h);

	// draw 'Play' and set startScreen clicklistener to active
	ctx.fillStyle = textColor || 'grey';
	ctx.textAlign = 'center';
	ctx.font = '30px' + fontFamily;
	ctx.fillText('Play', w / 2, h / 2);
	startScreen = true;
}

/**
 * Reset variables to default and (re)start
 */
function startSnake() {
	// Check if cellsize matches width and height
	if (w % cellsize !== 0 || h % cellsize !== 0) {
		alert('error');
	}

	// (re)set variables
	direction = 'right';
	nextDirection = direction;
	speed = parseInt($('#speed').val());
	deathScreen = false;
	startScreen = false;
	// fill the snake to startLength
	snake = [];
	for (var i = 0; i < startLength; i++) {
		snake.splice(0, 0, {
			x : (i * cellsize) + 0.5,
			y : 0.5
		})
	}

	// clear canvas
	ctx.beginPath();
	ctx.fillStyle = backgroudColor || 'white';
	ctx.fillRect(0, 0, w, h);

	// draw Snake and food
	drawSnake();
	createAndDrawFood();

	// start the party
	clearInterval(loop); // just to make sure
	startInterval();
}

function startInterval() {
	pause = false;
	loop = setInterval(function() {
		moveSnake();
		$('#score').text((snake.length - startLength) * speed);
	}, (10 - speed) * 20);
}

/**
 * Generates and draws new food item
 */
function createAndDrawFood() {
	var nextFood = {
		x : Math.floor(Math.random() * w / cellsize) * cellsize + 0.5,
		y : Math.floor(Math.random() * h / cellsize) * cellsize + 0.5
	};

	// check if nextFood inside of snake
	if (checkCollision(nextFood).length > 0) {
		createAndDrawFood();
		return;
	}

	// nextFood is valid, set as food and draw
	food = nextFood;
	ctx.beginPath();
	ctx.rect(food.x, food.y, cellsize, cellsize);
	ctx.fillStyle = foodColor || 'red';
	ctx.strokeStyle = backgroudColor || 'white';
	ctx.fill();
	ctx.stroke();

	// allows to pause one time per feeding
	pauseAllowed = true;
}

/**
 * Iterates over snake array and draws it
 */
function drawSnake() {
	ctx.beginPath();
	for ( var i in snake) {
		ctx.rect(snake[i].x, snake[i].y, cellsize, cellsize);
	}
	ctx.fillStyle = snakeColor || 'grey';
	ctx.strokeStyle = backgroudColor || 'white';
	ctx.fill();
	ctx.stroke();
}

/**
 * Make the snake move and eat And check for collisions with walls or the snake
 * itself
 */
function moveSnake() {
	var newHead = {};
	switch (nextDirection) {
	case 'left':
		newHead.x = snake[0].x - cellsize;
		newHead.y = snake[0].y;
		break;
	case 'right':
		newHead.x = snake[0].x + cellsize;
		newHead.y = snake[0].y;
		break;
	case 'up':
		newHead.x = snake[0].x;
		newHead.y = snake[0].y - cellsize;
		break;
	case 'down':
		newHead.x = snake[0].x;
		newHead.y = snake[0].y + cellsize;
		break;
	default:
		console.error('no valid direction given');
	}

	// Check for illegal Collision (snake hitting itself or walls)
	var oldTail = snake.pop(); // remove tail for collision check
	if (illegalCollision(newHead)) {
		snake.push(oldTail); // add old tail for correct length and score
		// calculation
		gameOver();
	} else {
		// add new Head
		snake.splice(0, 0, newHead);
		direction = nextDirection;

		// Check if snake is eating food
		if (checkCollision(food).length > 0) {
			snake.push(oldTail); // add old tail to increase snakes length
			createAndDrawFood();
		} else {
			// draw oldTail to BG color
			ctx.beginPath();
			ctx.fillStyle = backgroudColor || 'white';
			ctx.rect(oldTail.x, oldTail.y, cellsize, cellsize);
			ctx.fill();
		}
	}

	drawSnake(); // redraw Snake - just the head would do it too
}

/**
 * checking for collision between snake and given object {x,y}
 * 
 * @param obj
 * @returns {*} array of objects colliding with snake
 */
function checkCollision(obj) {
	return $.grep(snake, function(e) {
		return e.x === obj.x && e.y === obj.y;
	});
}

/**
 * Check for illegal Collision of obj (snakes Head) with the snake itself or
 * walls
 * 
 * @param obj
 * @returns {boolean}
 */
function illegalCollision(obj) {
	// Check for collision of snakes head with itself - must be done before
	// newHead is added to snake
	var collision = checkCollision(obj);
	if (collision.length > 0) {
		return true;
	}
	// Check for collision of head with walls
	if (obj.x > w || obj.x < 0 || obj.y > h || obj.y < 0) {
		return true;
	}
}

/**
 * Stop loop and show Score + retry
 */
function gameOver() {
	clearInterval(loop);
	deathScreen = true;
	var score = (snake.length - startLength) * speed;
	ctx.fillStyle = textColor || 'grey';
	ctx.textAlign = 'center';
	ctx.font = '30px' + fontFamily;
	ctx.fillText('Score: ' + score + '', w / 2, h / 2 - 30);
	ctx.font = '16px' + fontFamily;
	ctx.fillText(playAgain, w / 2, h / 2 + 30);
	playAgainMeasures = ctx.measureText(playAgain);
}