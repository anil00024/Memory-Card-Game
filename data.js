 // Game elements
        const gameGrid = document.getElementById('game-grid');
        const movesDisplay = document.getElementById('moves');
        const timerDisplay = document.getElementById('timer');
        const newGameBtn = document.getElementById('new-game');
        const congratsModal = document.getElementById('congratulations');
        const finalMovesDisplay = document.getElementById('final-moves');
        const finalTimeDisplay = document.getElementById('final-time');
        const playAgainBtn = document.getElementById('play-again');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // Game state
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let totalPairs = 0;
        let moves = 0;
        let gameActive = false;
        let timer = null;
        let seconds = 0;
        let gridRows = 4;
        let gridCols = 4;
        
        // Card images (emoji for simplicity, but could be replaced with actual image paths)
        const cardImages = [
            '🍎', '🍌', '🍒', '🍊', '🍇', '🍓', '🍉', '🍍', 
            '🥑', '🥝', '🥥', '🍄', '🌶️', '🥕', '🍗', '🧀',
            '🍕', '🍔', '🌮', '🍣', '🍦', '🍩', '🍪', '🎂',
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
            '🦁', '🐯', '🐨', '🐮', '🐷', '🐸', '🐵'
        ];
        
        // Confetti animation
        function createConfetti() {
            const confettiCount = 150;
            const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'];
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.opacity = Math.random().toFixed(1);
                confetti.style.width = Math.random() * 15 + 5 + 'px';
                confetti.style.height = Math.random() * 15 + 5 + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                document.body.appendChild(confetti);
                
                const animation = confetti.animate([
                    { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate3d(${Math.random() * 300 - 150}px, ${window.innerHeight}px, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 2000 + 3000,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    delay: Math.random() * 1500
                });
                
                animation.onfinish = () => {
                    confetti.remove();
                };
            }
        }
        
        // Initialize the game
        function initGame() {
            resetGame();
            createCards();
            startTimer();
            gameActive = true;
        }
        
        // Reset game state
        function resetGame() {
            gameGrid.innerHTML = '';
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            seconds = 0;
            movesDisplay.textContent = moves;
            timerDisplay.textContent = '00:00';
            clearInterval(timer);
            congratsModal.style.display = 'none';
            congratsModal.classList.remove('show');
            
            // Remove any leftover confetti
            document.querySelectorAll('.confetti').forEach(c => c.remove());
        }
        
        // Create cards based on grid size
        function createCards() {
            // Set grid template based on current grid size
            gameGrid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
            
            // Calculate total pairs needed
            totalPairs = Math.floor((gridRows * gridCols) / 2);
            
            // Get random images for the pairs
            const selectedImages = [...cardImages]
                .sort(() => 0.5 - Math.random())
                .slice(0, totalPairs);
            
            // Create pairs of cards
            cards = [...selectedImages, ...selectedImages]
                .sort(() => 0.5 - Math.random())
                .map((image, index) => ({
                    id: index,
                    image: image,
                    isFlipped: false,
                    isMatched: false
                }));
            
            // Create card elements with staggered animation
            cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.dataset.id = card.id;
                
                cardElement.innerHTML = `
                    <div class="card-inner">
                        <div class="card-face card-front">?</div>
                        <div class="card-face card-back">
                            <span style="font-size: 2.5em;">${card.image}</span>
                        </div>
                    </div>
                `;
                
                // Add staggered entrance animation
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.8)';
                
                cardElement.addEventListener('click', () => flipCard(card.id));
                gameGrid.appendChild(cardElement);
                
                // Animate card entrance
                setTimeout(() => {
                    cardElement.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    cardElement.style.opacity = '1';
                    cardElement.style.transform = 'scale(1)';
                }, index * 30);
            });
        }
        
        // Flip a card
        function flipCard(id) {
            // Ignore clicks if game is not active or if two cards are already flipped
            if (!gameActive || flippedCards.length >= 2) return;
            
            const card = cards.find(card => card.id === id);
            
            // Ignore clicks on already flipped or matched cards
            if (card.isFlipped || card.isMatched) return;
            
            // Flip the card
            card.isFlipped = true;
            flippedCards.push(card);
            
            // Update the UI
            const cardElement = document.querySelector(`.card[data-id="${id}"]`);
            cardElement.classList.add('flipped');
            
            // Add a subtle sound effect
            playFlipSound();
            
            // Check for match if two cards are flipped
            if (flippedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                
                setTimeout(checkForMatch, 600);
            }
        }
        
        // Play a card flip sound
        function playFlipSound() {
            // Simple way to create a quick sound effect
            const audio = new Audio();
            audio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
            audio.volume = 0.2;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Play a match sound
        function playMatchSound() {
            const audio = new Audio();
            audio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAACkwJAAAJVFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRaADuDpJnmMABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Play a win sound
        function playWinSound() {
            const audio = new Audio();
            audio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAANIwMAAApVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRaAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
            audio.volume = 0.4;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Check if the two flipped cards match
        function checkForMatch() {
            const [card1, card2] = flippedCards;
            
            if (card1.image === card2.image) {
                // Match found
                card1.isMatched = true;
                card2.isMatched = true;
                matchedPairs++;
                
                // Update UI to show matched cards
                const card1Element = document.querySelector(`.card[data-id="${card1.id}"]`);
                const card2Element = document.querySelector(`.card[data-id="${card2.id}"]`);
                
                card1Element.classList.add('matched');
                card2Element.classList.add('matched');
                
                // Play match sound
                playMatchSound();
                
                // Check if all pairs are matched
                if (matchedPairs === totalPairs) {
                    endGame();
                }
            } else {
                // No match - flip cards back
                card1.isFlipped = false;
                card2.isFlipped = false;
                
                const card1Element = document.querySelector(`.card[data-id="${card1.id}"]`);
                const card2Element = document.querySelector(`.card[data-id="${card2.id}"]`);
                
                card1Element.classList.remove('flipped');
                card2Element.classList.remove('flipped');
            }
            
            // Clear flipped cards array
            flippedCards = [];
        }
        
        // Start the timer
        function startTimer() {
            clearInterval(timer);
            seconds = 0;
            timer = setInterval(() => {
                seconds++;
                const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                timerDisplay.textContent = `${minutes}:${secs}`;
            }, 1000);
        }
        
        // End the game
        function endGame() {
            gameActive = false;
            clearInterval(timer);
            
            // Update final stats
            finalMovesDisplay.textContent = moves;
            finalTimeDisplay.textContent = timerDisplay.textContent;
            
            // Play win sound
            playWinSound();
            
            // Create confetti effect
            createConfetti();
            
            // Show congratulations modal with slight delay
            setTimeout(() => {
                congratsModal.style.display = 'flex';
                setTimeout(() => {
                    congratsModal.classList.add('show');
                }, 50);
            }, 600);
        }
        
        // Event listeners
        newGameBtn.addEventListener('click', initGame);
        playAgainBtn.addEventListener('click', initGame);
        
        // Difficulty buttons
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Set grid size based on button data
                const gridSize = btn.dataset.grid.split('x');
                gridCols = parseInt(gridSize[0]);
                gridRows = parseInt(gridSize[1]);
                
                // Start new game with new grid size
                initGame();
            });
        });
        
        // Start the game when the page loads
        window.addEventListener('DOMContentLoaded', initGame);