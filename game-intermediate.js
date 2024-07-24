import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { db } from './firebase-config.js';

async function fetchImages() {
    const imagesRef = collection(db, 'MemoryGamelevel2');
    const snapshot = await getDocs(imagesRef);
    const images = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.url && data.name) {
            console.log( data.name)
            images.push({ url: data.url, name: data.name });
        }
    });

    return images;
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

    gameBoard.classList.add('level-intermediate');

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
            gameBoard.classList.add('disabled');
            revealAllCards();
            enableButtons();
        }
    }, 1000);
}

function createCards(images) {
    
    const shuffledImages = images.sort(() => Math.random() - 0.5); // Shuffle

    return shuffledImages.map(({ url, name }) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.imageName = name; // Use the name for matching

        const imgElement = document.createElement('img');
        imgElement.src = url;
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

        if (isMatch(firstCard.dataset.imageName, secondCard.dataset.imageName)) {
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

function isMatch(name1, name2) {
    // Compare image names excluding the last character
    const baseName1 = name1.slice(0, -1);
    const baseName2 = name2.slice(0, -1);
    return baseName1 === baseName2;
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
