 // Game state variables
 let cards = [];
 let flippedCards = [];
 let matchedPairs = 0;
 let totalPairs = 8;
 let isProcessing = false;
 let moves = 0;
 let time = 0;
 let timerInterval;
 let gameStarted = false;
 let currentGridSize = 4;
 
 // Game elements
 const memoryGrid = document.getElementById('memory-grid');
 const movesElement = document.getElementById('moves');
 const timerElement = document.getElementById('timer');
 const scoreElement = document.getElementById('score');
 const newGameBtn = document.getElementById('new-game-btn');
 const difficultyBtns = document.querySelectorAll('.difficulty-btn');
 const congratulationsModal = document.getElementById('congratulations-modal');
 const finalMovesElement = document.getElementById('final-moves');
 const finalTimeElement = document.getElementById('final-time');
 const finalScoreElement = document.getElementById('final-score');
 const playAgainBtn = document.getElementById('play-again-btn');
 
 // Array of emoji icons for cards
 const cardIcons = [
     '🧜‍♀️', '🐻‍❄️', '😶‍🌫️', '🦕', '🐳', '🎁', '🎀', '☀️',
     '🦢', '🐯', '🤖', '🐪', '🐷', '🪼', '🦅', '🦚',
     '🦄', '🦋'
 ];
 
 // Initialize the game
 function initGame() {
     resetGameState();
     createCards();
     setupEventListeners();
 }
 
 // Reset game state variables
 function resetGameState() {
     cards = [];
     flippedCards = [];
     matchedPairs = 0;
     moves = 0;
     time = 0;
     isProcessing = false;
     gameStarted = false;
     memoryGrid.innerHTML = '';
     movesElement.textContent = '0';
     timerElement.textContent = '00:00';
     updateScore();
     
     if (timerInterval) {
         clearInterval(timerInterval);
         timerInterval = null;
     }
 }
 
 // Create and shuffle cards
 function createCards() {
     // Clear existing grid
     memoryGrid.innerHTML = '';
     
     // Set number of pairs based on grid size
     totalPairs = (currentGridSize * currentGridSize) / 2;
     
     // Select icons for this game
     const gameIcons = [...cardIcons].slice(0, totalPairs);
     
     // Create pairs of cards
     cards = [...gameIcons, ...gameIcons];
     
     // Shuffle the cards
     shuffleCards(cards);
     
     // Update grid class for CSS layout
     memoryGrid.className = currentGridSize === 6 ? 'memory-grid grid-6' : 'memory-grid';
     
     // Create card elements
     cards.forEach((icon, index) => {
         const cardElement = document.createElement('div');
         cardElement.classList.add('card');
         cardElement.dataset.index = index;
         
         const img = document.createElement('div');
         img.innerHTML = icon;
         img.style.fontSize = '2em';
         
         cardElement.appendChild(img);
         memoryGrid.appendChild(cardElement);
     });
 }
 
 // Shuffle cards using Fisher-Yates algorithm
 function shuffleCards(array) {
     for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]];
     }
     return array;
 }
 
 // Set up event listeners
 function setupEventListeners() {
     // Card click event
     memoryGrid.addEventListener('click', handleCardClick);
     
     // New Game button
     newGameBtn.addEventListener('click', () => {
         initGame();
     });
     
     // Difficulty buttons
     difficultyBtns.forEach(btn => {
         btn.addEventListener('click', () => {
             difficultyBtns.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             currentGridSize = parseInt(btn.dataset.size);
             initGame();
         });
     });
     
     // Play Again button in modal
     playAgainBtn.addEventListener('click', () => {
         congratulationsModal.style.display = 'none';
         initGame();
     });
 }
 
 // Handle card click
 function handleCardClick(event) {
     const clickedCard = event.target.closest('.card');
     
     if (!clickedCard || isProcessing || clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
         return;
     }
     
     // Start timer on first card click
     if (!gameStarted) {
         startTimer();
         gameStarted = true;
     }
     
     // Flip the card
     flipCard(clickedCard);
     
     // Add to flipped cards array
     flippedCards.push(clickedCard);
     
     // Check if two cards are flipped
     if (flippedCards.length === 2) {
         isProcessing = true;
         incrementMoves();
         checkForMatch();
     }
 }
 
 // Flip a card
 function flipCard(card) {
     card.classList.add('flipped');
 }
 
 // Unflip a card
 function unflipCard(card) {
     card.classList.remove('flipped');
 }
 
 // Check if flipped cards match
 function checkForMatch() {
     const [card1, card2] = flippedCards;
     const index1 = parseInt(card1.dataset.index);
     const index2 = parseInt(card2.dataset.index);
     
     // Check if the card icons match
     if (cards[index1] === cards[index2]) {
         handleMatch(card1, card2);
     } else {
         setTimeout(() => {
             unflipCard(card1);
             unflipCard(card2);
             isProcessing = false;
         }, 1000);
     }
     
     // Reset flipped cards array
     flippedCards = [];
 }
 
 // Handle matching cards
 function handleMatch(card1, card2) {
     card1.classList.add('matched');
     card2.classList.add('matched');
     
     matchedPairs++;
     updateScore();
     
     if (matchedPairs === totalPairs) {
         endGame();
     }
     
     isProcessing = false;
 }
 
 // Increment moves counter
 function incrementMoves() {
     moves++;
     movesElement.textContent = moves;
 }
 
 // Start the timer
 function startTimer() {
     timerInterval = setInterval(() => {
         time++;
         updateTimer();
     }, 1000);
 }
 
 // Update the timer display
 function updateTimer() {
     const minutes = Math.floor(time / 60).toString().padStart(2, '0');
     const seconds = (time % 60).toString().padStart(2, '0');
     timerElement.textContent = `${minutes}:${seconds}`;
 }
 
 // Calculate and update score
 function updateScore() {
     let baseScore = matchedPairs * 100;
     let timeDeduction = Math.floor(time / 5);
     let movesDeduction = Math.floor(moves * 5);
     
     // Adjust score based on difficulty
     let difficultyMultiplier = currentGridSize === 6 ? 1.5 : 1;
     
     let score = Math.max(0, Math.floor((baseScore - timeDeduction - movesDeduction) * difficultyMultiplier));
     scoreElement.textContent = score;
     return score;
 }
 
 // End the game
 function endGame() {
     clearInterval(timerInterval);
     
     // Calculate final score
     const finalScore = updateScore();
     
     // Update modal
     finalMovesElement.textContent = moves;
     finalTimeElement.textContent = timerElement.textContent;
     finalScoreElement.textContent = finalScore;
     
     // Show congratulations modal
     setTimeout(() => {
         congratulationsModal.style.display = 'flex';
     }, 1000);
 }
 
 // Initialize the game when the page loads
 window.onload = initGame;