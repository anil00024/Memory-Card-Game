// Card emojis and images
const cardEmojis = {
    easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆'],
    hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦄', '🦓', '🦒', '🦌', '🐴', '🐗', '🦇', '🦅', '🦉', '🦚', '🦜', '🐿️']
};

// Card themes (alternative to emojis)
const cardThemes = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆'],
    food: ['🍎', '🍌', '🍒', '🍓', '🍇', '🍉', '🍊', '🍋', '🍍', '🥭', '🍑', '🥝', '🍅', '🥑', '🍆', '🥦', '🥕', '🌽'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '⛳', '🥊', '🥋', '⛸️', '🎯', '🪀'],
    space: ['🌞', '🌙', '⭐', '🌟', '✨', '☄️', '💫', '🌈', '🌠', '🌌', '🪐', '🌍', '🌎', '🌏', '🔭', '🚀', '👨‍🚀', '👩‍🚀']
};

// Game variables
let gridSize = 4;
let difficulty = 'easy';
let currentTheme = 'animals';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let isProcessing = false;
let moves = 0;
let score = 0;
let gameStarted = false;
let timerInterval;
let seconds = 0;
let minutes = 0;

// DOM elements
const memoryGrid = document.getElementById('memory-grid');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const newGameButton = document.getElementById('new-game-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const modal = document.getElementById('congratulations-modal');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');
const finalScore = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-btn');
const themeButtons = document.querySelectorAll('.theme-btn');

// Initialize the game
function initializeGame() {
    resetGame();
    createCards();
    setupEventListeners();
}

// Reset game state
function resetGame() {
    memoryGrid.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    isProcessing = false;
    moves = 0;
    score = 0;
    seconds = 0;
    minutes = 0;
    gameStarted = false;
    movesElement.textContent = moves;
    scoreElement.textContent = score;
    timerElement.textContent = '00:00';
    clearInterval(timerInterval);
}

// Create cards based on current grid size and theme
function createCards() {
    const totalPairs = (gridSize * gridSize) / 2;
    
    // Select emojis based on current theme and difficulty
    let selectedSymbols;
    if (currentTheme === 'animals' || currentTheme === 'default') {
        selectedSymbols = cardEmojis[difficulty].slice(0, totalPairs);
    } else {
        selectedSymbols = cardThemes[currentTheme].slice(0, totalPairs);
    }
    
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle the cards
    const shuffledCards = shuffleArray(cardPairs);
    
    // Create card elements
    memoryGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    memoryGrid.dataset.size = gridSize;
    
    shuffledCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.cardIndex = index;
        card.dataset.theme = currentTheme;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${symbol}</div>
            </div>
        `;
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Card click event
    memoryGrid.addEventListener('click', handleCardClick);
    
    // New game button
    newGameButton.addEventListener('click', initializeGame);
    
    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', changeDifficulty);
    });
    
    // Theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', changeTheme);
    });
    
    // Play again button
    playAgainButton.addEventListener('click', () => {
        modal.style.display = 'none';
        initializeGame();
    });
}

// Handle card click
function handleCardClick(event) {
    const clickedCard = event.target.closest('.card');
    
    if (!clickedCard || isProcessing || clickedCard.classList.contains('flipped') || 
        clickedCard.classList.contains('matched')) {
        return;
    }
    
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    flipCard(clickedCard);
    
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesElement.textContent = moves;
        
        checkForMatch();
    }
}

// Flip card animation
function flipCard(card) {
    // Add flip sound
    playSound('flip');
    
    // Add enhanced animation class
    card.classList.add('flipping');
    setTimeout(() => {
        card.classList.remove('flipping');
        card.classList.add('flipped');
    }, 150);
    
    flippedCards.push(card);
}

// Play sound effects
function playSound(type) {
    // Create sound effect (could be replaced with actual audio files)
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    switch(type) {
        case 'flip':
            oscillator.type = 'sine';
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.1;
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.1);
            break;
        case 'match':
            oscillator.type = 'sine';
            oscillator.frequency.value = 500;
            gainNode.gain.value = 0.1;
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.2);
            break;
        case 'complete':
            oscillator.type = 'sine';
            oscillator.frequency.value = 700;
            gainNode.gain.value = 0.1;
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
            break;
    }
}

// Check if two flipped cards match
function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstCardEmoji = firstCard.querySelector('.card-back').textContent;
    const secondCardEmoji = secondCard.querySelector('.card-back').textContent;
    
    if (firstCardEmoji === secondCardEmoji) {
        matchCards();
    } else {
        unflipCards();
    }
}

// Handle matching cards
function matchCards() {
    const [firstCard, secondCard] = flippedCards;
    
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Add celebration animation
    addConfetti(firstCard);
    addConfetti(secondCard);
    
    // Add score based on difficulty
    let baseScore;
    switch(difficulty) {
        case 'easy':
            baseScore = 10;
            break;
        case 'medium':
            baseScore = 15;
            break;
        case 'hard':
            baseScore = 25;
            break;
        default:
            baseScore = 10;
    }
    
    score += baseScore;
    scoreElement.textContent = score;
    
    // Animate score increase
    animateScore(baseScore);
    
    matchedPairs++;
    
    if (matchedPairs === (gridSize * gridSize) / 2) {
        endGame();
    }
    
    resetFlippedCards();
}

// Add confetti animation to matched cards
function addConfetti(card) {
    for (let i = 0; i < 8; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.setProperty('--confetti-x', Math.random() * 100 + '%');
        confetti.style.setProperty('--confetti-y', (Math.random() * 80 + 10) + '%');
        confetti.style.setProperty('--confetti-rotation', (Math.random() * 360) + 'deg');
        confetti.style.backgroundColor = getRandomColor();
        card.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 1000);
    }
}

// Get random confetti color
function getRandomColor() {
    const colors = ['#ffd700', '#ff4500', '#00ff00', '#1e90ff', '#ff1493', '#9400d3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Animate score increase
function animateScore(points) {
    const pointsElement = document.createElement('div');
    pointsElement.classList.add('points-animation');
    pointsElement.textContent = `+${points}`;
    
    document.querySelector('.game-info').appendChild(pointsElement);
    
    setTimeout(() => {
        pointsElement.remove();
    }, 1000);
}

// Handle non-matching cards
function unflipCards() {
    setTimeout(() => {
        flippedCards.forEach(card => {
            card.classList.remove('flipped');
        });
        resetFlippedCards();
    }, 1000);
}

// Reset flipped cards array
function resetFlippedCards() {
    flippedCards = [];
    isProcessing = false;
}

// Handle game completion
function endGame() {
    clearInterval(timerInterval);
    
    // Play victory sound
    playSound('complete');
    
    // Calculate final score with time bonus
    const timeElapsed = minutes * 60 + seconds;
    let timeBonusMultiplier;
    
    switch(difficulty) {
        case 'easy': 
            timeBonusMultiplier = 1;
            break;
        case 'medium': 
            timeBonusMultiplier = 2;
            break;
        case 'hard': 
            timeBonusMultiplier = 3;
            break;
        default:
            timeBonusMultiplier = 1;
    }
    
    const timeBonus = Math.max(0, 300 - timeElapsed) * timeBonusMultiplier;
    const finalScoreValue = score + timeBonus;
    
    // Update modal content
    document.getElementById('final-difficulty').textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    finalMoves.textContent = moves;
    finalTime.textContent = formatTime(minutes, seconds);
    finalScore.textContent = finalScoreValue;
    
    // Show modal with animation
    setTimeout(() => {
        modal.style.display = 'flex';
        
        // Animate stars
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            setTimeout(() => {
                star.classList.add('animate');
            }, index * 300);
        });
    }, 500);
}

// Timer functions
function startTimer() {
    seconds = 0;
    minutes = 0;
    timerElement.textContent = '00:00';
    
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        timerElement.textContent = formatTime(minutes, seconds);
    }, 1000);
}

// Format time as MM:SS
function formatTime(minutes, seconds) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Change difficulty
function changeDifficulty(event) {
    const button = event.target;
    
    // Update active button
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update game settings
    gridSize = parseInt(button.dataset.size);
    difficulty = button.dataset.difficulty;
    
    // Reset and initialize game
    initializeGame();
}

// Change theme
function changeTheme(event) {
    const button = event.target;
    
    // Update active button
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update theme
    currentTheme = button.dataset.theme;
    
    // Update card back colors based on theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Reset and initialize game
    initializeGame();
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialize the game on load
document.addEventListener('DOMContentLoaded', initializeGame);