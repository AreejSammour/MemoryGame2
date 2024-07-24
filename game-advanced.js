import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { db } from './firebase-config.js'; 

async function fetchImages() {
    const imagesRef = collection(db, 'MemoryGamelevel3');
    const snapshot = await getDocs(imagesRef);
    const urls = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.url) {
            urls.push(data.url);
        }
    });

    return urls.slice(0, 12); // Fetch only 6 images for the beginner level
}

export async function initGame(gameBoard, timeInterval) {
    const images = await fetchImages();
    startGame(gameBoard, images, timeInterval);
}

let timer;
let timeRemaining;

function startGame(gameBoard, images, timeInterval) {
    const messageElement = document.getElementById('message');
    gameBoard.innerHTML = '';
    messageElement.innerHTML = '';

    gameBoard.classList.add('level-advanced');

    const cards = createCards(images);
    gameBoard.append(...cards);

    timeRemaining = timeInterval;
    updateTimer();

    timer = setInterval(() => {
        timeRemaining--;
        updateTimer();

        if (timeRemaining <= 0) {
            clearInterval(timer);
            document.getElementById('message').innerHTML = '<img id="faceicon" src="/img/sad.png" alt="faceicon"> Time is over! Try again.';
            gameBoard.classList.add('disabled'); // Add a class to disable further clicks
            revealAllCards();
            enableButtons();
            startGameBtn.textContent = 'Restart Game'
          }
    }, 1000);
}

function createCards(images) {
    const doubledImages = images.concat(images);
    const shuffledImages = doubledImages.sort(() => Math.random() - 0.5);

    return shuffledImages.map((image) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.style.display = 'none';

        card.appendChild(imgElement);

        card.addEventListener('click', () => {
            if (!card.classList.contains('flipped') && !card.classList.contains('matched')) {
                card.classList.add('flipped');
                imgElement.style.display = 'block';
                checkMatch();
            }
        });

        return card;
    });
}

let firstCard = null;
let secondCard = null;

function checkMatch() {
    const flippedCards = document.querySelectorAll('.card.flipped:not(.matched)');

    if (flippedCards.length === 2) {
        [firstCard, secondCard] = flippedCards;

        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard = null;
            secondCard = null;

            if (document.querySelectorAll('.card.matched').length === document.querySelectorAll('.card').length) {
                clearInterval(timer);
                document.getElementById('message').innerHTML = '<img id="faceicon" src="/img/happy-face.png" alt="faceicon"> Congratulations! You finished the game.';
                enableButtons();
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                firstCard.querySelector('img').style.display = 'none';
                secondCard.querySelector('img').style.display = 'none';
                firstCard = null;
                secondCard = null;
            }, 1000);
        }
    }
}

function updateTimer() {
    document.getElementById('message').textContent = `Time remaining: ${timeRemaining} seconds`;
}

function revealAllCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.add('flipped');
    card.querySelector('img').style.display = 'block';
  });
}

function enableButtons() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
      button.disabled = false;
  });

  const timeSelect = document.getElementById('time-interval');
  timeSelect.disabled = false;
}
      