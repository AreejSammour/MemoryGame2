// Existing code for the slider

import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { db } from './firebase-config.js'; 

async function fetchImages() {
    const imagesRef = collection(db, 'MemoryGameSlideImages');
    const snapshot = await getDocs(imagesRef);
    const urls = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.url) {
            urls.push(data.url);
        }
    });

    return urls;
}

let currentSlide = 0;
const slidesContainer = document.getElementById('slides');

function createSlides(images) {
    slidesContainer.innerHTML = images.map(url => `
        <div class="slide">
            <img src="${url}" alt="Slide">
        </div>
    `).join('');
    showSlide(currentSlide); 
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return; 
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;

    const offset = -currentSlide * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide--;
    showSlide(currentSlide);
}

document.addEventListener('DOMContentLoaded', async () => {
    const images = await fetchImages();
    createSlides(images);
    setInterval(nextSlide, 3000); 
});

// Handle level button clicks
document.getElementById('beginner-btn').addEventListener('click', () => loadGame('beginner'));
document.getElementById('beginner-btn1').addEventListener('click', () => loadGame('beginner'));
document.getElementById('intermediate-btn').addEventListener('click', () => loadGame('intermediate'));
document.getElementById('intermediate-btn1').addEventListener('click', () => loadGame('intermediate'));
document.getElementById('advanced-btn').addEventListener('click', () => loadGame('advanced'));
document.getElementById('advanced-btn1').addEventListener('click', () => loadGame('advanced'));

async function loadGame(level) {
  const gameContainer = document.getElementById('game-container');
  // Scroll the page to hide the hero container

  window.scrollTo({
    top: document.body.scrollHeight, // Scroll to the bottom of the page
    behavior: 'smooth' // Smooth scrolling effect
  });

  gameContainer.innerHTML = `
      <div id="game-description"></div>
      <div class="time-selection">
          <label for="time-interval">Select Time Interval:</label>
          <select id="time-interval">
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
          </select>
          <button id="start-game-btn">Start Game</button>
      </div>
      <div id="message"></div>
      <div id="game-board" class="game-container"></div>
  `;

  const startGameBtn = document.getElementById('start-game-btn');
  startGameBtn.addEventListener('click', async () => {
      const selectedTime = parseInt(document.getElementById('time-interval').value, 10);
      let gameModule;
      let descriptionText = '';

      switch (level) {
          case 'beginner':
              descriptionText = 'In the first level, you will match every two same images together.';
              gameModule = await import('./game-beginner.js');
              break;
          case 'intermediate':
              descriptionText = 'At the intermediate level, you will find the image and its opposite.';
              gameModule = await import('./game-intermediate.js');
              break;
          case 'advanced':
              descriptionText = 'In the third level, you will match pairs of dominoes with the same numbers.';
              gameModule = await import('./game-advanced.js');
              break;
          default:
              gameContainer.innerHTML = '<p>Select a level to start the game.</p>';
              return;
      }

      disableButtons();

        // Display the description for the selected level
        const gameDescription = document.getElementById('game-description');
        if (gameDescription) {
            gameDescription.textContent = descriptionText;
        }
        
        // Initialize the game with the appropriate module and timing
        if (gameModule && typeof gameModule.initGame === 'function') {
            gameModule.initGame(document.getElementById('game-board'), selectedTime);
            
        }
    });
}

function disableButtons() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
      button.disabled = true;
  });

  const timeSelect = document.getElementById('time-interval');
  timeSelect.disabled = true;
}

 