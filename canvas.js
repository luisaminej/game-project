/*


HTML Canvas tutorial walking through the source code of this game: 

https://youtu.be/Ymbv6m3EuNw

Follow me on Twitter for more: https://twitter.com/HunorBorbely

*/

// Game data
let gameStarted; // Boolean

let balloonX;
let balloonY;

let verticalVelocity; // Current vertical velocity of the balloon
let horizontalVelocity; // Current horizontal velocity of the balloon

let fuel; // Percentage of fuel left
let heating; // Boolean: Is the mouse down or not?

let pyramids; // Metadata of the trees in an array
let backgroundTrees; // Metadata of the trees on the hills in the background

// Configuration
const mainAreaWidth = 400;
const mainAreaHeight = 375;
let horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
let verticalPadding = (window.innerHeight - mainAreaHeight) / 2;

const hill1BaseHeight = 80;
const hill1Speed = 0.2;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 50;
const hill2Speed = 0.2;
const hill2Amplitude = 15;
const hill2Stretch = 0.5;
const hill3BaseHeight = 15;
const hill3Speed = 1;
const hill3Amplitude = 10;
const hill3Stretch = 0.2;

const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction");
const restartButton = document.getElementById("restart");

// Add a custom sin function that takes degrees instead of radians
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// Initialize layout
resetGame();

// Resets game variables and layouts but does not start the game (game starts on keypress)
function resetGame() {
  // Reset game progress
  gameStarted = false;
  heating = false;
  verticalVelocity = 5;
  horizontalVelocity = 5;
  balloonX = 0;
  balloonY = 0;
  fuel = 100;

  introductionElement.style.opacity = 1;
  restartButton.style.display = "none";

  pyramids = [];
  for (let i = 1; i < window.innerWidth / 50; i++) generatePyramids();

  backgroundTrees = [];
  for (let i = 1; i < window.innerWidth / 30; i++) generateBackgroundTree();

  draw();
}

function generateBackgroundTree() {
  const minimumGap = 30;
  const maximumGap = 150;

  // X coordinate of the right edge of the furthest tree
  const lastTree = backgroundTrees[backgroundTrees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  backgroundTrees.push({ x, color });
}
function generatePyramids() {
  const minimumGap = 50; // Minimum distance between two trees
  const maximumGap = 600; // Maximum distance between two trees

  const newPyramid = pyramids.length
    ? pyramids[pyramids.length - 1].newPyramid +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap))
    : 400;
    pyramids.push(newPyramid)
}
resetGame();

// If space was pressed restart the game
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    resetGame();
    return;
  }
});

window.addEventListener("mousedown", function () {
  heating = true;

  if (!gameStarted) {
    introductionElement.style.opacity = 0;
    gameStarted = true;
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function () {
  heating = false;
});

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
  verticalPadding = (window.innerHeight - mainAreaHeight) / 2;
  draw();
});

// The main game loop
function animate() {
  if (!gameStarted) return;

  const velocityChangeWhileHeating = 0.4;
  const velocityChangeWhileCooling = 0.2;

  if (heating && fuel > 0) {
    if (verticalVelocity > -8) {
      // Limit maximum rising spead
      verticalVelocity -= velocityChangeWhileHeating;
    }
    fuel -= 0.002 * -balloonY;
  } else if (verticalVelocity < 5) {
    // Limit maximum descending spead
    verticalVelocity += velocityChangeWhileCooling;
  }

  balloonY += verticalVelocity; // Move the balloon up or down
  if (balloonY > 0) balloonY = 0; // The balloon landed on the ground
  if (balloonY < 0) balloonX += horizontalVelocity; // Move balloon to the right if not on the ground

  // If a tree moves out of the picture replace it with a new one
  if (pyramids[0].x - (balloonX - horizontalPadding) < -100) {
    pyramids.shift(); // Remove first item in array
    generatePyramids(); // Add a new item to the array
  }

  // If a tree on the background hill moves out of the picture replace it with a new one
  if (
    backgroundTrees[0].x - (balloonX * hill1Speed - horizontalPadding) <
    -40
  ) {
    backgroundTrees.shift(); // Remove first item in array
    generateBackgroundTree(); // Add a new item to the array
  }

  draw(); // Re-render the whole scene

  // If the balloon hit a tree OR ran out of fuel and landed then stop the game
  const hit = hitDetection();
  if (hit || (fuel <= 0 && balloonY >= 0)) {
    restartButton.style.display = "block";
    return;
  }

  window.requestAnimationFrame(animate);
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawSky(); // Fill the background with a gradient

  ctx.save();
  ctx.translate(0, verticalPadding + mainAreaHeight);
  drawBackgroundHills();

  ctx.translate(horizontalPadding, 0);

  // Center main canvas area to the middle of the screen
  ctx.translate(-balloonX, 0);

  // Draw scene
  drawPyramids();
  drawBalloon();

  // Restore transformation
  ctx.restore();

  // Header is last because it's on top of everything else
  drawHeader();
}

restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  resetGame();
  restartButton.style.display = "none";
});

function drawCircle(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fill();
}

 function drawPyramids() {
      
          ctx.save();
         
      
      const pyramidWidth = 80;    
      ctx.fillStyle = "#c99f16";
      ctx.beginPath();
      ctx.moveTo(pyramidWidth,0);
      ctx.lineTo(0,-pyramidWidth);
      ctx.lineTo(-pyramidWidth,0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
 
}

function drawBalloon() {
  ctx.save();

  ctx.translate(balloonX, balloonY);

  // Cart
  ctx.fillStyle = "orange";
  ctx.fillRect(-30, -40, 60, 10);
  ctx.fillStyle = "yellow";
  ctx.fillRect(-30, -30, 60, 30);

  // Cables
  ctx.strokeStyle = "purple";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -40);
  ctx.lineTo(-24, -60);
  ctx.moveTo(24, -40);
  ctx.lineTo(24, -60);
  ctx.stroke();

  // Balloon
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(-30, -60);
  ctx.quadraticCurveTo(-80, -120, -80, -160);
  ctx.arc(0, -160, 80, Math.PI, 0, false);
  ctx.quadraticCurveTo(80, -120, 30, -60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHeader() {
  // Fuel meter
  ctx.strokeStyle = fuel <= 30 ? "blue" : "orange";
  ctx.strokeRect(30, 30, 150, 30);
  ctx.fillStyle = fuel <= 30 
    ? "rgba(255,0,0,0.5)" 
    : "rgba(150,150,200,0.5)";
  ctx.fillRect(30, 30, (150 * fuel) / 100, 30);

  // Score
  const score = Math.floor(balloonX / 30);
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Tahoma";
  ctx.textAlign = "end";
  ctx.textBaseline = "top";
  ctx.fillText(`${score} m`, window.innerWidth - 30, 30);
}

function drawSky() {
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#AADBEA");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawBackgroundHills() {
  // Draw hills
  drawHill(
    hill1BaseHeight,
    hill1Speed,
    hill1Amplitude,
    hill1Stretch,
    "#AAD155" // #95C629"
  );
  drawHill(
    hill2BaseHeight,
    hill2Speed,
    hill2Amplitude,
    hill2Stretch,
    "#84B249" // "#659F1C"
  );

  drawHill(
    hill3BaseHeight,
    hill3Speed,
    hill3Amplitude,
    hill3Stretch,
    "#26532B"
  );

  // Draw background trees
  backgroundTrees.forEach((tree) => drawBackgroundTree(tree.x, tree.color));
}

// A hill is a shape under a stretched out sinus wave
function drawHill(baseHeight, speedMultiplier, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i <= window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, speedMultiplier, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBackgroundTree(x, color) {
  ctx.save();
  ctx.translate(
    (-balloonX * hill1Speed + x) * hill1Stretch,
    getTreeY(x, hill1BaseHeight, hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  // Draw trunk
  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // Draw crown
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function getHillY(x, baseHeight, speedMultiplier, amplitude, stretch) {
  const sineBaseY = -baseHeight;
  return (
    Math.sinus((balloonX * speedMultiplier + x) * stretch) * amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = -baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}

function hitDetection() {
  const cartBottomLeft = { x: balloonX - 30, y: balloonY };
  const cartBottomRight = { x: balloonX + 30, y: balloonY };
  const cartTopRight = { x: balloonX + 30, y: balloonY - 40 };

  
    const pyramidTop = { x: balloonX, y: balloonY };

    if (getDistance(cartBottomLeft, pyramidTop) < balloonX.x) return true;
    if (getDistance(cartBottomRight, pyramidTop) < balloonX.x) return true;
    if (getDistance(cartTopRight, pyramidTop) < balloonX.x) return true;
    if (getDistance(cartBottomLeft, pyramidTop) < balloonY.y) return true;
    if (getDistance(cartBottomRight, pyramidTop) < balloonY.y) return true;
    if (getDistance(cartTopRight, pyramidTop) < balloonY.y) return true;
      }


function getDistance(point1, point2) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}

