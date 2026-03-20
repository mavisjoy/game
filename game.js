// Game Constants
const TILE_SIZE = 16;
const MAP_WIDTH = 28;
const MAP_HEIGHT = 31;

// Colors
const COLORS = {
    wall: '#2121de',
    dot: '#ffb8ae',
    powerPellet: '#ffb8ae',
    pacman: '#ffff00',
    blinky: '#ff0000',  // Red ghost
    pinky: '#ffb8ff',   // Pink ghost
    inky: '#00ffff',    // Cyan ghost
    clyde: '#ffb852',   // Orange ghost
    frightened: '#2121de',
    eyes: '#fff'
};

// Sound Generator using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playWaka() {
        if (!this.enabled || !this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playPowerPellet() {
        if (!this.enabled || !this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    playDeath() {
        if (!this.enabled || !this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.5);
    }

    speakGameOver() {
        if (!this.enabled) return;
        const utterance = new SpeechSynthesisUtterance("You are doomed!");
        utterance.rate = 0.8;
        utterance.pitch = 0.5;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    playGhostEaten() {
        if (!this.enabled || !this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playStart() {
        if (!this.enabled || !this.audioContext) return;
        const notes = [262, 330, 392, 523];
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.15);
            osc.start(this.audioContext.currentTime + i * 0.15);
            osc.stop(this.audioContext.currentTime + i * 0.15 + 0.15);
        });
    }
}


// Game Map (0=empty, 1=wall, 2=dot, 3=power pellet, 4=ghost house)
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Pac-Man class
class PacMan {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speed = 2;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    update(map) {
        // Animate mouth
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 1 || this.mouthOpen < 0) {
            this.mouthSpeed = -this.mouthSpeed;
        }

        // Try to change direction
        if (this.canMove(this.nextDirection, map)) {
            this.direction = this.nextDirection;
        }

        // Move
        if (this.canMove(this.direction, map)) {
            switch (this.direction) {
                case 'up': this.y -= this.speed; break;
                case 'down': this.y += this.speed; break;
                case 'left': this.x -= this.speed; break;
                case 'right': this.x += this.speed; break;
            }
        }

        // Tunnel wrap
        if (this.x < 0) this.x = MAP_WIDTH * TILE_SIZE;
        if (this.x > MAP_WIDTH * TILE_SIZE) this.x = 0;
    }

    canMove(direction, map) {
        let nextX = this.x;
        let nextY = this.y;
        const buffer = 2;

        switch (direction) {
            case 'up': nextY -= this.speed + buffer; break;
            case 'down': nextY += this.speed + buffer; break;
            case 'left': nextX -= this.speed + buffer; break;
            case 'right': nextX += this.speed + buffer; break;
        }

        const tileX = Math.floor(nextX / TILE_SIZE);
        const tileY = Math.floor(nextY / TILE_SIZE);

        if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
            return direction === 'left' || direction === 'right';
        }

        return map[tileY][tileX] !== 1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);

        // Rotate based on direction
        const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
        ctx.rotate(angles[this.direction]);

        // Draw Pac-Man
        ctx.beginPath();
        ctx.fillStyle = COLORS.pacman;
        const mouthAngle = this.mouthOpen * 0.4;
        ctx.arc(0, 0, TILE_SIZE / 2 + 2, mouthAngle, Math.PI * 2 - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.restore();
    }
}


// Ghost class
class Ghost {
    constructor(x, y, color, name) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.direction = 'up';
        this.speed = 1.5;
        this.frightened = false;
        this.frightenedTimer = 0;
        this.eaten = false;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.direction = 'up';
        this.frightened = false;
        this.eaten = false;
    }

    update(map, pacman) {
        if (this.frightened) {
            this.frightenedTimer--;
            if (this.frightenedTimer <= 0) {
                this.frightened = false;
            }
        }

        // Simple AI: move towards Pac-Man or random when frightened
        if (Math.random() < 0.02 || !this.canMove(this.direction, map)) {
            this.chooseDirection(map, pacman);
        }

        if (this.canMove(this.direction, map)) {
            const speed = this.frightened ? this.speed * 0.5 : this.speed;
            switch (this.direction) {
                case 'up': this.y -= speed; break;
                case 'down': this.y += speed; break;
                case 'left': this.x -= speed; break;
                case 'right': this.x += speed; break;
            }
        }

        // Tunnel wrap
        if (this.x < 0) this.x = MAP_WIDTH * TILE_SIZE;
        if (this.x > MAP_WIDTH * TILE_SIZE) this.x = 0;
    }

    chooseDirection(map, pacman) {
        const directions = ['up', 'down', 'left', 'right'];
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
        const validDirections = directions.filter(d => 
            d !== opposite[this.direction] && this.canMove(d, map)
        );

        if (validDirections.length === 0) {
            validDirections.push(opposite[this.direction]);
        }

        if (this.frightened) {
            // Random movement when frightened
            this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        } else {
            // Chase Pac-Man
            let bestDirection = validDirections[0];
            let bestDistance = Infinity;

            validDirections.forEach(d => {
                let testX = this.x;
                let testY = this.y;
                switch (d) {
                    case 'up': testY -= TILE_SIZE; break;
                    case 'down': testY += TILE_SIZE; break;
                    case 'left': testX -= TILE_SIZE; break;
                    case 'right': testX += TILE_SIZE; break;
                }
                const dist = Math.hypot(testX - pacman.x, testY - pacman.y);
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestDirection = d;
                }
            });

            this.direction = bestDirection;
        }
    }

    canMove(direction, map) {
        let nextX = this.x;
        let nextY = this.y;

        switch (direction) {
            case 'up': nextY -= TILE_SIZE / 2; break;
            case 'down': nextY += TILE_SIZE / 2; break;
            case 'left': nextX -= TILE_SIZE / 2; break;
            case 'right': nextX += TILE_SIZE / 2; break;
        }

        const tileX = Math.floor(nextX / TILE_SIZE);
        const tileY = Math.floor(nextY / TILE_SIZE);

        if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
            return direction === 'left' || direction === 'right';
        }

        return map[tileY][tileX] !== 1;
    }

    setFrightened() {
        this.frightened = true;
        this.frightenedTimer = 600; // ~10 seconds at 60fps
    }

    draw(ctx) {
        ctx.save();
        const x = this.x + TILE_SIZE / 2;
        const y = this.y + TILE_SIZE / 2;
        const radius = TILE_SIZE / 2 + 2;

        // Ghost body
        ctx.beginPath();
        ctx.fillStyle = this.frightened ? COLORS.frightened : this.color;
        
        // Head (semicircle)
        ctx.arc(x, y - 2, radius, Math.PI, 0);
        
        // Body
        ctx.lineTo(x + radius, y + radius - 4);
        
        // Wavy bottom
        const waveCount = 3;
        const waveWidth = (radius * 2) / waveCount;
        for (let i = 0; i < waveCount; i++) {
            const waveX = x + radius - (i + 1) * waveWidth;
            ctx.quadraticCurveTo(
                waveX + waveWidth / 2, y + radius + 4,
                waveX, y + radius - 4
            );
        }
        
        ctx.closePath();
        ctx.fill();

        // Eyes
        if (!this.frightened) {
            // White part
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
            ctx.arc(x + 4, y - 4, 4, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#00f';
            let pupilOffsetX = 0, pupilOffsetY = 0;
            switch (this.direction) {
                case 'up': pupilOffsetY = -2; break;
                case 'down': pupilOffsetY = 2; break;
                case 'left': pupilOffsetX = -2; break;
                case 'right': pupilOffsetX = 2; break;
            }
            ctx.beginPath();
            ctx.arc(x - 4 + pupilOffsetX, y - 4 + pupilOffsetY, 2, 0, Math.PI * 2);
            ctx.arc(x + 4 + pupilOffsetX, y - 4 + pupilOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Frightened face
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
            ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Wavy mouth
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 6, y + 4);
            for (let i = 0; i < 4; i++) {
                ctx.lineTo(x - 6 + i * 4 + 2, y + (i % 2 === 0 ? 6 : 2));
            }
            ctx.stroke();
        }

        ctx.restore();
    }
}


// Main Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        
        this.sound = new SoundManager();
        this.map = JSON.parse(JSON.stringify(MAP));
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        
        // Create Pac-Man
        this.pacman = new PacMan(14 * TILE_SIZE, 23 * TILE_SIZE);
        
        // Create Ghosts
        this.ghosts = [
            new Ghost(14 * TILE_SIZE, 11 * TILE_SIZE, COLORS.blinky, 'Blinky'),
            new Ghost(12 * TILE_SIZE, 14 * TILE_SIZE, COLORS.pinky, 'Pinky'),
            new Ghost(14 * TILE_SIZE, 14 * TILE_SIZE, COLORS.inky, 'Inky'),
            new Ghost(16 * TILE_SIZE, 14 * TILE_SIZE, COLORS.clyde, 'Clyde')
        ];
        
        this.setupControls();
        this.draw();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch (e.key) {
                case 'ArrowUp': this.pacman.nextDirection = 'up'; break;
                case 'ArrowDown': this.pacman.nextDirection = 'down'; break;
                case 'ArrowLeft': this.pacman.nextDirection = 'left'; break;
                case 'ArrowRight': this.pacman.nextDirection = 'right'; break;
            }
            e.preventDefault();
        });

        this.startBtn.addEventListener('click', () => this.start());
    }

    start() {
        this.sound.init();
        this.sound.playStart();
        this.reset();
        this.gameRunning = true;
        this.gameOver = false;
        this.startBtn.textContent = 'Restart';
        this.gameLoop();
    }

    reset() {
        this.map = JSON.parse(JSON.stringify(MAP));
        this.score = 0;
        this.lives = 3;
        this.pacman.reset();
        this.ghosts.forEach(g => g.reset());
        this.updateUI();
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.pacman.update(this.map);
        this.ghosts.forEach(ghost => ghost.update(this.map, this.pacman));
        
        this.checkDotCollision();
        this.checkGhostCollision();
        this.checkWin();
    }

    checkDotCollision() {
        const tileX = Math.floor((this.pacman.x + TILE_SIZE / 2) / TILE_SIZE);
        const tileY = Math.floor((this.pacman.y + TILE_SIZE / 2) / TILE_SIZE);
        
        if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
            const tile = this.map[tileY][tileX];
            
            if (tile === 2) {
                this.map[tileY][tileX] = 0;
                this.score += 10;
                this.sound.playWaka();
                this.updateUI();
            } else if (tile === 3) {
                this.map[tileY][tileX] = 0;
                this.score += 50;
                this.sound.playPowerPellet();
                this.ghosts.forEach(g => g.setFrightened());
                this.updateUI();
            }
        }
    }

    checkGhostCollision() {
        this.ghosts.forEach(ghost => {
            const dist = Math.hypot(
                this.pacman.x - ghost.x,
                this.pacman.y - ghost.y
            );
            
            if (dist < TILE_SIZE) {
                if (ghost.frightened) {
                    // Eat ghost
                    ghost.reset();
                    this.score += 200;
                    this.sound.playGhostEaten();
                    this.updateUI();
                } else {
                    // Pac-Man dies
                    this.lives--;
                    this.sound.playDeath();
                    this.updateUI();
                    
                    if (this.lives <= 0) {
                        this.endGame();
                    } else {
                        this.pacman.reset();
                        this.ghosts.forEach(g => g.reset());
                    }
                }
            }
        });
    }

    checkWin() {
        let dotsRemaining = 0;
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (this.map[y][x] === 2 || this.map[y][x] === 3) {
                    dotsRemaining++;
                }
            }
        }
        
        if (dotsRemaining === 0) {
            this.score += 1000;
            this.updateUI();
            this.map = JSON.parse(JSON.stringify(MAP));
            this.pacman.reset();
            this.ghosts.forEach(g => g.reset());
        }
    }

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.sound.speakGameOver();
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw map
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = this.map[y][x];
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                
                if (tile === 1) {
                    // Wall
                    this.ctx.fillStyle = COLORS.wall;
                    this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                } else if (tile === 2) {
                    // Dot
                    this.ctx.fillStyle = COLORS.dot;
                    this.ctx.beginPath();
                    this.ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (tile === 3) {
                    // Power pellet (animated)
                    this.ctx.fillStyle = COLORS.powerPellet;
                    const size = 4 + Math.sin(Date.now() / 200) * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        
        // Draw ghosts
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
        
        // Draw Pac-Man
        this.pacman.draw(this.ctx);
        
        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
}

// Start game when page loads
window.onload = () => {
    new Game();
};
