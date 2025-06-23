// Snake and Ladder Game - Enhanced version

// Canvas and context
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// UI Elements
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const gameStatus = document.getElementById("gameStatus");
const diceElement = document.getElementById("dice");

// Game constants
const rows = 10;
const cols = 10;
const size = 80; // Cell size
const totalSquares = rows * cols;

// Game state variables
let gameRunning = false;
let moveInterval;
let snakeAnimations = {};
let animationFrame;
let lastTime = 0;
let diceValue = 1;

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

// Snakes with programming languages
const snakes = {
    16: { end: 6, language: "C" },
    46: { end: 25, language: "C++" },
    49: { end: 11, language: "Java" },
    62: { end: 19, language: "Python" },
    64: { end: 60, language: "JavaScript" },
    87: { end: 24, language: "React" },
    93: { end: 73, language: "PHP" },
    95: { end: 75, language: "HTML" },
    98: { end: 78, language: "CSS" }
};

// Ladders
const ladders = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    51: 67,
    72: 91,
    80: 99
};

// Programming language colors
const langIcons = {
    "C": "#5c6bc0",
    "C++": "#7e57c2",
    "Java": "#ef5350",
    "Python": "#26a69a",
    "JavaScript": "#ffca28",
    "PHP": "#7986cb",
    "HTML": "#ff7043",
    "CSS": "#29b6f6",
    "React": "#66bb6a",
    "Flask": "#bdbdbd",
    "SQL": "#9ccc65",
    "Firebase": "#ffa726",
    "Git": "#ec407a",
    "GitHub": "#78909c",
    "FastAPI": "#26c6da",
    "Node": "#8bc34a",
    "VSCode": "#42a5f5",
    "Xcode": "#5c6bc0",
    "R": "#7b1fa2",
    "Bootstrap": "#7e57c2"
};

// Initialize snake animations
for (const startPos in snakes) {
    snakeAnimations[startPos] = {
        offset: 0,
        direction: 1,
        speed: 0.2 + Math.random() * 0.3,
        tongueOut: false,
        tongueTimer: Math.random() * 1000
    };
}

// Convert board position to canvas coordinates
function positionToCoordinates(pos) {
    let row = Math.floor((pos - 1) / cols);
    let col = (pos - 1) % cols;
    if (row % 2 === 1) col = cols - 1 - col;
    return {
        x: col * size,
        y: (rows - 1 - row) * size
    };
}

// Draw the game board with all elements
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw the checkerboard pattern
    let number = 1;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * size;
            const y = (rows - 1 - row) * size;

            // Alternate red and white cells with gradient effect
            if ((row + col) % 2 === 0) {
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, "#f44336"); // Red
                gradient.addColorStop(1, "#d32f2f"); // Darker red
                ctx.fillStyle = gradient;
            } else {
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, "#ffffff"); // White
                gradient.addColorStop(1, "#f5f5f5"); // Slight off-white
                ctx.fillStyle = gradient;
            }
            ctx.fillRect(x, y, size, size);

            // Draw cell borders
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.strokeRect(x, y, size, size);

            // Draw numbers with better styling
            ctx.fillStyle = (row + col) % 2 === 0 ? "#ffffff" : "#000000";
            ctx.font = "bold 22px 'Poppins', sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(number, x + 8, y + 8);

            number++;
        }
    }

    // Draw ladders with 3D effect
    drawLadders();

    // Draw snakes with animation
    drawSnakes();
}

// Draw ladders with 3D effect
function drawLadders() {
    for (const startPos in ladders) {
        const start = parseInt(startPos);
        const end = ladders[start];

        const startCoord = positionToCoordinates(start);
        const endCoord = positionToCoordinates(end);

        const ladderWidth = 20;

        // Calculate angle and length
        const dx = endCoord.x - startCoord.x;
        const dy = endCoord.y - startCoord.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        // 3D effect with shadows and gradients
        // Shadow for ladder
        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 2 - ladderWidth / 2 + 4, startCoord.y + size / 2 + 4);
        ctx.lineTo(endCoord.x + size / 2 - ladderWidth / 2 + 4, endCoord.y + size / 2 + 4);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 2 + ladderWidth / 2 + 4, startCoord.y + size / 2 + 4);
        ctx.lineTo(endCoord.x + size / 2 + ladderWidth / 2 + 4, endCoord.y + size / 2 + 4);
        ctx.stroke();

        // Gradient for ladder rails
        const railGradient = ctx.createLinearGradient(
            startCoord.x + size / 2, startCoord.y + size / 2,
            endCoord.x + size / 2, endCoord.y + size / 2
        );
        railGradient.addColorStop(0, "#00bcd4"); // Light blue
        railGradient.addColorStop(1, "#0097a7"); // Darker blue

        // Main ladder rails
        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 2 - ladderWidth / 2, startCoord.y + size / 2);
        ctx.lineTo(endCoord.x + size / 2 - ladderWidth / 2, endCoord.y + size / 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = railGradient;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startCoord.x + size / 2 + ladderWidth / 2, startCoord.y + size / 2);
        ctx.lineTo(endCoord.x + size / 2 + ladderWidth / 2, endCoord.y + size / 2);
        ctx.stroke();

        // Draw rungs with 3D effect
        const steps = Math.floor(length / 25) + 1;
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const x = startCoord.x + ratio * dx + size / 2;
            const y = startCoord.y + ratio * dy + size / 2;

            // Shadow for rung
            const rungX1 = x - Math.cos(angle + Math.PI / 2) * ladderWidth / 2;
            const rungY1 = y - Math.sin(angle + Math.PI / 2) * ladderWidth / 2;
            const rungX2 = x + Math.cos(angle + Math.PI / 2) * ladderWidth / 2;
            const rungY2 = y + Math.sin(angle + Math.PI / 2) * ladderWidth / 2;

            ctx.beginPath();
            ctx.moveTo(rungX1 + 3, rungY1 + 3);
            ctx.lineTo(rungX2 + 3, rungY2 + 3);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();

            // Rung gradient
            const rungGradient = ctx.createLinearGradient(rungX1, rungY1, rungX2, rungY2);
            rungGradient.addColorStop(0, "#006064"); // Dark blue
            rungGradient.addColorStop(0.5, "#00838f"); // Medium blue
            rungGradient.addColorStop(1, "#006064"); // Dark blue again

            // Actual rung
            ctx.beginPath();
            ctx.moveTo(rungX1, rungY1);
            ctx.lineTo(rungX2, rungY2);
            ctx.lineWidth = 5;
            ctx.strokeStyle = rungGradient;
            ctx.stroke();
        }
    }
}

// Draw animated snakes
function drawSnakes() {
    for (const startPos in snakes) {
        const start = parseInt(startPos);
        const end = snakes[start].end;
        const language = snakes[start].language;

        const startCoord = positionToCoordinates(start);
        const endCoord = positionToCoordinates(end);

        // Get animation properties for this snake
        const animation = snakeAnimations[startPos];

        // Update animation offset
        animation.offset += animation.direction * animation.speed;
        if (animation.offset > 10 || animation.offset < -10) {
            animation.direction *= -1;
        }

        // Update tongue animation
        animation.tongueTimer -= 16; // Approx time between frames
        if (animation.tongueTimer <= 0) {
            animation.tongueOut = !animation.tongueOut;
            animation.tongueTimer = Math.random() * 3000 + 1000; // Random time between 1-4 seconds
        }

        // Draw a more realistic snake with segments
        const dx = endCoord.x - startCoord.x;
        const dy = endCoord.y - startCoord.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Number of segments based on distance
        const segments = Math.max(15, Math.floor(distance / 25));

        // Create snake body with undulating motion
        const points = [];

        // Head position
        points.push({
            x: startCoord.x + size / 2,
            y: startCoord.y + size / 2
        });

        // Body segments with wave pattern
        for (let i = 1; i < segments; i++) {
            const ratio = i / segments;

            // Basic interpolated position
            const baseX = startCoord.x + dx * ratio + size / 2;
            const baseY = startCoord.y + dy * ratio + size / 2;

            // Add undulating wave effect
            const waveFreq = 0.3;
            const waveAmp = 15;
            const wave = Math.sin((ratio * 10 + animation.offset) * waveFreq) * waveAmp;

            // Calculate perpendicular offset
            const perpX = -dy / distance * wave;
            const perpY = dx / distance * wave;

            points.push({
                x: baseX + perpX,
                y: baseY + perpY
            });
        }

        // Tail position
        points.push({
            x: endCoord.x + size / 2,
            y: endCoord.y + size / 2
        });

        // Draw snake body segments
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Calculate segment width (thicker near head)
            const segmentWidth = 16 * (1 - 0.7 * i / points.length);

            // Shadow for 3D effect
            ctx.beginPath();
            ctx.moveTo(p1.x + 3, p1.y + 3);
            ctx.lineTo(p2.x + 3, p2.y + 3);
            ctx.lineWidth = segmentWidth + 2;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();

            // Snake body segment with patterns
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = segmentWidth;

            // Color gradient for snake body
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, "#ffeb3b"); // Yellow
            gradient.addColorStop(0.5, "#fdd835"); // Slightly darker yellow
            gradient.addColorStop(1, "#ffeb3b"); // Yellow again
            ctx.strokeStyle = gradient;
            ctx.stroke();

            // Add snake pattern (diamonds) every few segments
            if (i % 4 === 0 && i > 0) {
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                ctx.beginPath();
                ctx.arc(midX, midY, segmentWidth * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = "#f57f17"; // Dark orange
                ctx.fill();
            }
        }

        // Draw snake head
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 22, 0, Math.PI * 2);

        // Gradient for head
        const headGradient = ctx.createRadialGradient(
            points[0].x, points[0].y, 5,
            points[0].x, points[0].y, 22
        );
        headGradient.addColorStop(0, "#ff9800"); // Orange
        headGradient.addColorStop(1, "#e65100"); // Darker orange
        ctx.fillStyle = headGradient;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        // Draw snake eyes
        // Left eye
        ctx.beginPath();
        ctx.arc(points[0].x - 8, points[0].y - 6, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(points[0].x - 8, points[0].y - 6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(points[0].x + 8, points[0].y - 6, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(points[0].x + 8, points[0].y - 6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();

        // Snake tongue (animated)
        if (animation.tongueOut) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y + 10);
            const tongueLength = 18;
            ctx.lineTo(points[0].x, points[0].y + tongueLength);
            ctx.lineTo(points[0].x - 6, points[0].y + tongueLength + 6);
            ctx.moveTo(points[0].x, points[0].y + tongueLength);
            ctx.lineTo(points[0].x + 6, points[0].y + tongueLength + 6);
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw language name near snake head with better visibility
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px 'Poppins', sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.fillText(language, points[0].x, points[0].y + 35);
        ctx.shadowBlur = 0;
        ctx.textAlign = "start";
    }
}

// Draw player token
function drawPlayer() {
    // Calculate target position
    if (!player.moving && player.currentStep < player.steps) {
        player.currentStep++;
        player.position = Math.min(player.position + 1, 100);

        const coord = positionToCoordinates(player.position);
        player.targetX = coord.x + size / 2;
        player.targetY = coord.y + size / 2;
        player.moving = true;

        gameStatus.textContent = `Roll: ${player.lastRoll} - Moving: ${player.currentStep}/${player.steps}`;
    }

    // Smooth movement toward target
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Faster movement
    if (distance > 1) {
        player.x += dx * 0.15; // Increased speed
        player.y += dy * 0.15; // Increased speed
        player.moving = true;
    } else {
        player.x = player.targetX;
        player.y = player.targetY;
        player.moving = false;

        // Check for snake or ladder after completing a move
        if (!player.moving && player.currentStep === player.steps) {
            setTimeout(() => {
                const oldPosition = player.position;

                if (snakes[player.position]) {
                    player.position = snakes[player.position].end;
                    gameStatus.textContent = `Ouch! Snake bit you from ${oldPosition} to ${player.position}!`;
                } else if (ladders[player.position]) {
                    player.position = ladders[player.position];
                    gameStatus.textContent = `Yay! Ladder from ${oldPosition} to ${player.position}!`;
                }

                if (oldPosition !== player.position) {
                    const coord = positionToCoordinates(player.position);
                    player.targetX = coord.x + size / 2;
                    player.targetY = coord.y + size / 2;
                    player.moving = true;
                }

                // Check win condition
                if (player.position >= 100) {
                    clearInterval(moveInterval);
                    gameRunning = false;
                    setTimeout(() => {
                        showWinAnimation();
                        startBtn.textContent = "Play Again";
                        startBtn.disabled = false;
                    }, 1000);
                }
            }, 300);
        }
    }

    // Enhanced player token with 3D effect
    // Shadow
    ctx.beginPath();
    ctx.arc(player.x + 3, player.y + 3, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fill();

    // Player glow effect
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 20;

    // Player token with pulsating effect
    const pulseSize = 18 + Math.sin(Date.now() / 200) * 3; // Larger pulse

    // Main circle
    ctx.beginPath();
    ctx.arc(player.x, player.y, pulseSize, 0, Math.PI * 2);

    // Gradient fill for player
    const gradient = ctx.createRadialGradient(
        player.x, player.y, 5,
        player.x, player.y, pulseSize
    );
    gradient.addColorStop(0, "#00ffff");
    gradient.addColorStop(0.7, "#00b3b3");
    gradient.addColorStop(1, "#008080");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight ring for player
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Reset shadow for text
    ctx.shadowBlur = 0;

    // Player label with 3D effect
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px 'Poppins', sans-serif";
    ctx.textAlign = "center";

    // Shadow text for 3D effect
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillText("MK", player.x + 1, player.y + 7);

    // Main text
    ctx.fillStyle = "#fff";
    ctx.fillText("MK", player.x, player.y + 6);
    ctx.textAlign = "start";
}

// Move player automatically
function movePlayer() {
    // Only start a new move if not currently moving and not in the middle of a multi-step move
    if (!player.moving && player.currentStep >= player.steps && player.position < 100) {
        // Generate true random steps between 1-6
        player.steps = Math.floor(Math.random() * 6) + 1;
        player.lastRoll = player.steps;
        player.currentStep = 0;

        // Update dice display
        updateDice(player.steps);

        gameStatus.textContent = `Roll: ${player.steps}`;
    }
}

// Update dice visual
function updateDice(value) {
    diceValue = value;

    // Map the value to dice rotation
    const rotations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(0deg) rotateY(-90deg)",
        3: "rotateX(-90deg) rotateY(0deg)",
        4: "rotateX(90deg) rotateY(0deg)",
        5: "rotateX(0deg) rotateY(90deg)",
        6: "rotateX(180deg) rotateY(0deg)"
    };

    // Create dots based on dice value
    let dots = "";
    for (let i = 0; i < value; i++) {
        dots += '<span class="dot"></span>';
    }

    // Apply to dice element
    diceElement.querySelector('.dice-face').innerHTML = dots;

    // Animate dice roll
    diceElement.style.transform = "rotate3d(1,1,1,720deg)";
    setTimeout(() => {
        diceElement.style.transform = rotations[value] || "rotateX(0deg) rotateY(0deg)";
    }, 1000);
}

// Win animation
function showWinAnimation() {
    gameStatus.textContent = "🎉 Congratulations! You've won! 🎉";

    // Create confetti effect
    for (let i = 0; i < 100; i++) {
        createConfetti();
    }
}

// Create confetti particle
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = -20 + 'px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.position = 'fixed';
    confetti.style.zIndex = '1000';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);

    const animation = confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)` },
        { transform: `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)` }
    ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'cubic-bezier(0,0,0.2,1)'
    });

    animation.onfinish = () => {
        confetti.remove();
    };
}

// Main game loop
function mainGameLoop() {
    // Calculate time delta
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    // Draw game elements
    drawBoard();
    drawPlayer();

    // Request next frame
    animationFrame = requestAnimationFrame(mainGameLoop);
}

// Start the game
function startGame() {
    if (gameRunning) return;

    // Reset player position
    player.position = 1;
    const startCoord = positionToCoordinates(player.position);
    player.x = startCoord.x + size / 2;
    player.y = startCoord.y + size / 2;
    player.targetX = player.x;
    player.targetY = player.y;
    player.moving = false;
    player.steps = 0;
    player.currentStep = 0;

    gameStatus.textContent = "Game started! Watch MK move.";
    gameRunning = true;
    startBtn.disabled = true;

    // Reset dice
    updateDice(1);

    // Start animation loop
    lastTime = Date.now();
    animationFrame = requestAnimationFrame(mainGameLoop);

    // Set up automatic movement every 2 seconds
    moveInterval = setInterval(() => {
        if (!player.moving && player.currentStep >= player.steps) {
            movePlayer();
        }
    }, 2000);
}

// Reset the game
function resetGame() {
    clearInterval(moveInterval);
    cancelAnimationFrame(animationFrame);
    gameRunning = false;

    player.position = 1;
    const startCoord = positionToCoordinates(player.position);
    player.x = startCoord.x + size / 2;
    player.y = startCoord.y + size / 2;
    player.targetX = player.x;
    player.targetY = player.y;
    player.moving = false;
    player.steps = 0;
    player.currentStep = 0;

    // Reset dice
    updateDice(1);

    // Redraw board
    drawBoard();
    drawPlayer();

    gameStatus.textContent = "Position: 1";
    startBtn.disabled = false;
    startBtn.textContent = "Start Game";

    // Remove any confetti
    document.querySelectorAll('.confetti').forEach(el => el.remove());
}

// Initialize game
const startCoord = positionToCoordinates(player.position);
player.x = startCoord.x + size / 2;
player.y = startCoord.y + size / 2;
player.targetX = player.x;
player.targetY = player.y;

// Initial render
drawBoard();
drawPlayer();

// Event listeners
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// Add some CSS for confetti
const styleSheet = document.createElement("style");
styleSheet.textContent = `
.confetti {
    pointer-events: none;
}
`;
document.head.appendChild(styleSheet);
