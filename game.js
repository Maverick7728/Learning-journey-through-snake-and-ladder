// Snake and Ladder Game - Enhanced version

// Canvas and context
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// UI Elements
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const gameStatus = document.getElementById("gameStatus");
const diceValueDisplay = document.getElementById("diceValue");
const historyDotsContainer = document.getElementById("historyDots");
const historyDots = Array.from(historyDotsContainer.children);

// Game constants
const rows = 10;
const cols = 10;
const size = 60; // Cell size
const totalSquares = rows * cols;

// Game state variables
let gameRunning = false;
let moveInterval;
let rollHistory = [1, 1, 1, 1, 1]; // Last 5 rolls

// Player configuration
const player = {
    position: 1,
    x: 0,
    y: 0,
    color: "#00ffff",
    targetX: 0,
    targetY: 0,
    moving: false,
    steps: 0,
    currentStep: 0,
    lastRoll: 0
};

// Snakes with programming languages (based on image)
const snakes = {
    16: { end: 6, language: "Python" },
    46: { end: 27, language: "Java" },
    49: { end: 11, language: "C++" },
    63: { end: 43, language: "JavaScript" },
    64: { end: 36, language: "GenAI" },
    89: { end: 53, language: "LLMs" },
    95: { end: 75, language: "PHP" },
    99: { end: 80, language: "HTML" },
    97: { end: 78, language: "CSS" }
};

// Ladders (based on image)
const ladders = {
    4: 25,
    9: 31,
    20: 42,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91
};

// Programming language colors
const langIcons = {
    "C": "#5c6bc0",
    "C++": "#7e57c2",
    "Java": "#ef5350",
    "Python": "#26a69a",
    "GenAI": "#9c27b0",
    "LLMs": "#3f51b5",
    "PHP": "#7986cb",
    "HTML": "#ff7043",
    "CSS": "#29b6f6",
    "JavaScript": "#ffca28"
};

// Convert board position to canvas coordinates
function positionToCoordinates(pos) {
    // Fix spiral numbering - proper snake and ladder board layout
    pos = parseInt(pos);
    const row = 9 - Math.floor((pos - 1) / cols);
    let col;

    // For even rows, numbers go from right to left
    // For odd rows, numbers go from left to right
    if (row % 2 === 0) {
        col = (pos - 1) % cols;
    } else {
        col = 9 - ((pos - 1) % cols);
    }

    return {
        x: col * size,
        y: row * size
    };
}

// Draw the game board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard pattern - similar to image
    let number = 1;
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < cols; col++) {
            // Adjust column based on row parity to match zigzag pattern
            const actualCol = row % 2 === 0 ? col : 9 - col;
            const x = actualCol * size;
            const y = row * size;

            // Light cream color for all cells like in the image
            ctx.fillStyle = "#FFFDD0";  // Cream color
            ctx.fillRect(x, y, size, size);

            // Draw cell borders
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.strokeRect(x, y, size, size);

            // Draw numbers
            // Black for regular numbers, red for snake positions
            if (snakes[number]) {
                ctx.fillStyle = "#FF0000"; // Red for snake positions
            } else {
                ctx.fillStyle = "#000000"; // Black for regular numbers
            }
            ctx.font = "bold 16px Arial";
            ctx.fillText(number, x + size / 2 - 8, y + size / 2 + 6);

            number++;
        }
    }

    // Draw START and FINISH
    const startCoord = positionToCoordinates(1);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.fillText("START", startCoord.x + 5, startCoord.y + 15);

    const finishCoord = positionToCoordinates(100);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.fillText("FINISH", finishCoord.x + 5, finishCoord.y + 15);

    // Draw ladders first (so snakes appear on top)
    drawLadders();

    // Draw snakes
    drawSnakes();

    // Draw player token
    drawPlayer();
}

// Draw realistic ladders like in the image
function drawLadders() {
    for (const startPos in ladders) {
        const start = parseInt(startPos);
        const end = ladders[start];

        const startCoord = positionToCoordinates(start);
        const endCoord = positionToCoordinates(end);

        // Calculate ladder properties
        const dx = endCoord.x - startCoord.x;
        const dy = endCoord.y - startCoord.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);
        const ladderWidth = 12;

        // Draw the ladder rails (light blue like in the image)
        // Left rail
        ctx.strokeStyle = "#00BCD4"; // Light blue
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 4, startCoord.y + size / 2);
        ctx.lineTo(endCoord.x + size / 4, endCoord.y + size / 2);
        ctx.stroke();

        // Right rail
        ctx.beginPath();
        ctx.moveTo(startCoord.x + size * 3 / 4, startCoord.y + size / 2);
        ctx.lineTo(endCoord.x + size * 3 / 4, endCoord.y + size / 2);
        ctx.stroke();

        // Draw rungs
        const numRungs = Math.floor(length / 30);
        const railDist = size / 2;

        for (let i = 0; i <= numRungs; i++) {
            const t = i / numRungs;
            const x = startCoord.x + t * dx + size / 2;
            const y = startCoord.y + t * dy + size / 2;

            const rungAngle = angle + Math.PI / 2;

            ctx.strokeStyle = "#0097A7"; // Darker blue for rungs
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - Math.cos(rungAngle) * railDist / 2, y - Math.sin(rungAngle) * railDist / 2);
            ctx.lineTo(x + Math.cos(rungAngle) * railDist / 2, y + Math.sin(rungAngle) * railDist / 2);
            ctx.stroke();
        }
    }
}

// Draw curved snakes like in the image
function drawSnakes() {
    for (const startPos in snakes) {
        const start = parseInt(startPos);
        const end = snakes[start].end;
        const language = snakes[start].language;

        const startCoord = positionToCoordinates(start);
        const endCoord = positionToCoordinates(end);

        // Calculate control points for curved snake
        const midX = (startCoord.x + endCoord.x) / 2;
        const midY = (startCoord.y + endCoord.y) / 2;

        // Calculate an offset for the curve
        const dx = endCoord.x - startCoord.x;
        const dy = endCoord.y - startCoord.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalX = -dy / dist;
        const normalY = dx / dist;

        // Offset the control point to create a curve
        const curveOffset = size * 2;
        const ctrlX = midX + normalX * curveOffset;
        const ctrlY = midY + normalY * curveOffset;

        // Draw the snake's body with a quadratic curve - red like in the image
        ctx.strokeStyle = "#FF6B6B"; // Snake reddish color from image
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 2, startCoord.y + size / 2);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endCoord.x + size / 2, endCoord.y + size / 2);
        ctx.stroke();

        // Draw snake head at start position
        ctx.beginPath();
        ctx.arc(startCoord.x + size / 2, startCoord.y + size / 2, 15, 0, Math.PI * 2);
        if (langIcons[language]) {
            ctx.fillStyle = langIcons[language];
        } else {
            ctx.fillStyle = "#FF4500"; // Default orange-red
        }
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw eyes on snake
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(startCoord.x + size / 2 - 5, startCoord.y + size / 2 - 3, 3, 0, Math.PI * 2);
        ctx.arc(startCoord.x + size / 2 + 5, startCoord.y + size / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(startCoord.x + size / 2 - 5, startCoord.y + size / 2 - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(startCoord.x + size / 2 + 5, startCoord.y + size / 2 - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw language name at snake head - IMPROVED READABILITY
        ctx.fillStyle = "#000000"; // Black text for better contrast
        ctx.font = "bold 14px Arial"; // Larger font
        ctx.textAlign = "center"; // Center text
        ctx.fillText(language, startCoord.x + size / 2, startCoord.y + size / 2 + 25); // Position slightly lower
        ctx.textAlign = "left";
    }
}

// Draw player token
function drawPlayer() {
    const coord = positionToCoordinates(player.position);
    player.x = coord.x + size / 2;
    player.y = coord.y + size / 2;

    // Draw glow effect
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 15;

    // Draw player piece - similar to the blue piece in image
    ctx.beginPath();
    ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#0000FF"; // Blue like in image
    ctx.fill();

    // Draw player piece top
    ctx.beginPath();
    ctx.arc(player.x, player.y - 5, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#0000CC"; // Darker blue for top
    ctx.fill();

    ctx.shadowBlur = 0; // Reset shadow

    // Draw MK text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MK", player.x, player.y + 3);
    ctx.textAlign = "left";
}

// Update dice display
function updateDice(value) {
    // Update visual dice
    diceValueDisplay.textContent = value;

    // Update roll history
    rollHistory.shift();
    rollHistory.push(value);

    // Update history dots
    historyDots.forEach((dot, index) => {
        dot.className = "history-dot";
        if (index < 5) {
            if (rollHistory[index] >= 4) {
                dot.classList.add("active");
            }
        }
    });

    // Animate the dice
    diceValueDisplay.parentElement.style.transform = "scale(1.2)";
    setTimeout(() => {
        diceValueDisplay.parentElement.style.transform = "scale(1)";
    }, 300);
}

// Move player - IMPROVED TIMING
function movePlayer() {
    if (player.position >= 100) return;

    // Roll dice
    const steps = Math.floor(Math.random() * 6) + 1;

    // Update dice display
    updateDice(steps);

    // Update position
    const newPosition = Math.min(player.position + steps, 100);
    gameStatus.textContent = `Rolled ${steps} - Moving to ${newPosition}`;

    // Longer pause before movement starts (1 second)
    setTimeout(() => {
        // Animate movement
        let currentPos = player.position;
        const moveStep = () => {
            if (currentPos < newPosition) {
                currentPos++;
                player.position = currentPos;
                drawBoard();

                setTimeout(moveStep, 300);
            } else {
                // Check for snake or ladder
                checkSnakeOrLadder();
            }
        };

        moveStep();
    }, 1000);
}

// Check if player landed on a snake or ladder
function checkSnakeOrLadder() {
    if (snakes[player.position]) {
        const newPos = snakes[player.position].end;
        gameStatus.textContent = `Oops! Snake to ${newPos}`;

        // Short pause before sliding down the snake
        setTimeout(() => {
            player.position = newPos;
            drawBoard();

            // Check win condition
            checkWinCondition();
        }, 1000);
    } else if (ladders[player.position]) {
        const newPos = ladders[player.position];
        gameStatus.textContent = `Yay! Ladder to ${newPos}`;

        // Short pause before climbing the ladder
        setTimeout(() => {
            player.position = newPos;
            drawBoard();

            // Check win condition
            checkWinCondition();
        }, 1000);
    } else {
        // Check win condition
        checkWinCondition();
    }
}

// Check if player has won
function checkWinCondition() {
    if (player.position >= 100) {
        gameStatus.textContent = "You Win! 🎉";
        clearInterval(moveInterval);
        startBtn.textContent = "Play Again";
        startBtn.disabled = false;
    }
}

// Start the game
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    startBtn.disabled = true;

    // Reset player position
    player.position = 1;

    // Draw initial board
    drawBoard();

    // First move after a short delay
    setTimeout(() => {
        movePlayer();

        // Set up movement interval with longer delay (3 seconds total between moves)
        moveInterval = setInterval(() => {
            movePlayer();
        }, 3000); // Increased to 3 seconds for more time between moves
    }, 1000);
}

// Reset the game
function resetGame() {
    clearInterval(moveInterval);

    player.position = 1;
    gameRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = "Start Game";
    gameStatus.textContent = "Game Reset";

    // Reset dice and history
    updateDice(1);
    rollHistory = [1, 1, 1, 1, 1];

    // Draw board with reset state
    drawBoard();
}

// Initialize the game
updateDice(1);
drawBoard();

// Set up event listeners
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
