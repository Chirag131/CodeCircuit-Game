const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const pauseBtn = document.getElementById('pauseBtn');
const powerupMsg = document.getElementById('powerupMessage');
const flipSound = new Audio('flip.mp3');
const shuffleSound = new Audio('shuffle.mp3');


let cards = [], flipped = [], matched = [];
let score = 0, moves = 0, time = 0;
let interval;
let revealAllCount = 0; // Reveal All uses tracker

// Pause popup
const pausePopup = document.createElement('div');
pausePopup.id = 'pausePopup';
pausePopup.style.display = 'none';
pausePopup.style.position = 'fixed';
pausePopup.style.top = '50%';
pausePopup.style.left = '50%';
pausePopup.style.transform = 'translate(-50%, -50%)';
pausePopup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
pausePopup.style.color = '#fff';
pausePopup.style.padding = '30px';
pausePopup.style.borderRadius = '15px';
pausePopup.style.textAlign = 'center';
pausePopup.style.zIndex = '1000';
pausePopup.innerHTML = `
  <h2>Game Paused</h2>
  <button id="resumeBtn">Resume</button>
  <button id="restartBtn">Restart</button>`;
document.body.appendChild(pausePopup);

// Win popup
const winPopup = document.createElement('div');
winPopup.id = 'winPopup';
winPopup.style.display = 'none';
winPopup.style.position = 'fixed';
winPopup.style.top = '50%';
winPopup.style.left = '50%';
winPopup.style.transform = 'translate(-50%, -50%)';
winPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
winPopup.style.color = '#fff';
winPopup.style.padding = '30px';
winPopup.style.borderRadius = '15px';
winPopup.style.textAlign = 'center';
winPopup.style.zIndex = '1000';
winPopup.innerHTML = `
  <h2>🎉 You Win!</h2>
  <button id="nextBtn">Next</button>
  <button id="menuBtn">Menu</button>
`;
document.body.appendChild(winPopup);

pauseBtn.addEventListener('click', () => {
  clearInterval(interval);
  pausePopup.style.display = 'block';
});

document.getElementById('resumeBtn').addEventListener('click', () => {
  pausePopup.style.display = 'none';
  startTimer();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  pausePopup.style.display = 'none';
  startGame();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  winPopup.style.display = 'none';
  startGame();  // Restart game with same difficulty
});

document.getElementById('menuBtn').addEventListener('click', () => {
  window.location.href = 'memory_setup.html'; // Go back to setup page
});

function showMessage(msg) {
  powerupMsg.textContent = msg;
  powerupMsg.style.display = 'block';
  setTimeout(() => powerupMsg.style.display = 'none', 2000);
}

function getBoardSize(difficulty) {
  switch(difficulty) {
    case 'easy': return 4;
    case 'medium': return 6;
    case 'hard': return 8;
    case 'ultra': return 10;
    default: return 4;
  }
}

function startGame() {
  score = 0; moves = 0; time = 0;
  flipped = []; matched = [];
  revealAllCount = 0;
  scoreEl.textContent = 'Score: 0';
  movesEl.textContent = 'Moves: 0';
  timerEl.textContent = 'Time: 0s';
  clearInterval(interval);

  const revealBtn = document.getElementById('revealBtn');
  if (revealBtn) revealBtn.textContent = `Reveal All (3 left)`;
  
  createCards();
  startTimer();
  displayLeaderboard();
  updatePowerupButtons();

  // Hide popups if visible
  pausePopup.style.display = 'none';
  winPopup.style.display = 'none';
}

function startTimer() {
  interval = setInterval(() => {
    time++;
    timerEl.textContent = `Time: ${time}s`;
  }, 1000);
}

function createCards() {
  const difficulty = localStorage.getItem('memory_game_difficulty') || 'easy';
  const size = getBoardSize(difficulty);
  board.style.gridTemplateColumns = `repeat(${size}, 80px)`;
  const totalCards = size * size;

  const emojiSet = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪲','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬'];
  const emojis = emojiSet.slice(0, totalCards / 2);
  cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());

  board.innerHTML = '';
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

function canUsePowerups() {
  // Disable power-ups if any card is flipped and not matched
  return flipped.length === 0;
}

function updatePowerupButtons() {
  const disable = !canUsePowerups();
  document.querySelectorAll('#controls button').forEach(btn => btn.disabled = disable);
}

function flipCard(card) {
  if (flipped.length === 2 || flipped.includes(card) || matched.includes(card)) return;
  card.textContent = card.dataset.emoji;
  // Play flip sound
  flipSound.currentTime = 0; // rewind if needed
  flipSound.play();
  card.classList.add('flipped');
  flipped.push(card);
  updatePowerupButtons();
  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = 'Moves: ' + moves;
    setTimeout(checkMatch, 700);
  }
}

function checkMatch() {
  const [first, second] = flipped;
  if (first.dataset.emoji === second.dataset.emoji) {
    matched.push(first, second);
    score += 10;
    scoreEl.textContent = 'Score: ' + score;
    first.classList.add('matched');
    second.classList.add('matched');
    if (matched.length === cards.length) {
      clearInterval(interval);
      updateLeaderboard(time);  // use time for leaderboard
      showMessage('🎉 You Win!');
      displayLeaderboard();
      // Show the win popup
      winPopup.style.display = 'block';
    }
  } else {
    first.textContent = '';
    second.textContent = '';
    first.classList.remove('flipped');
    second.classList.remove('flipped');
  }
  flipped = [];
  updatePowerupButtons();
}

// Power-ups

function revealAll() {
  if (!canUsePowerups()) {
    alert('Finish your current pair before using power-ups!');
    return;
  }
  if (revealAllCount >= 3) {
    alert('Reveal All power-up limit reached (3 times per game)');
    return;
  }
  revealAllCount++;
  const revealBtn = document.getElementById('revealBtn');
  if (revealBtn) revealBtn.textContent = `Reveal All (${3 - revealAllCount} left)`;

  document.querySelectorAll('.card').forEach(card => {
    if (!matched.includes(card)) {
      card.textContent = card.dataset.emoji;
      card.classList.add('flipped');
    }
  });
  showMessage("👀 All cards revealed!");
  setTimeout(() => {
    document.querySelectorAll('.card').forEach(card => {
      if (!matched.includes(card)) {
        card.textContent = '';
        card.classList.remove('flipped');
      }
    });
  }, 2000);
}

function shuffleUnmatched() {
  shuffleSound.currentTime = 0;
  shuffleSound.play();
  if (!canUsePowerups()) {
    alert('Finish your current pair before using power-ups!');
    return;
  }
  // Gather unmatched indices and their emojis
  const unmatchedIndices = [];
  for (let i = 0; i < cards.length; i++) {
    if (!matched.some(card => parseInt(card.dataset.index) === i)) {
      unmatchedIndices.push(i);
    }
  }

  // Extract unmatched emojis
  const unmatchedEmojis = unmatchedIndices.map(i => cards[i]);

  // Shuffle unmatched emojis
  for (let i = unmatchedEmojis.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unmatchedEmojis[i], unmatchedEmojis[j]] = [unmatchedEmojis[j], unmatchedEmojis[i]];
  }

    // Put shuffled emojis back only in unmatched positions
  unmatchedIndices.forEach((pos, idx) => {
    cards[pos] = unmatchedEmojis[idx];
  });

  // Update card elements on board
  unmatchedIndices.forEach(pos => {
    const cardElem = board.querySelector(`.card[data-index='${pos}']`);
    if (cardElem && !matched.includes(cardElem)) {
      cardElem.textContent = '';
      cardElem.classList.remove('flipped');
      cardElem.dataset.emoji = cards[pos];
    }
  });

  showMessage("🔀 Unmatched cards shuffled!");
}

function updateLeaderboard(time) {
  const difficulty = localStorage.getItem('memory_game_difficulty') || 'easy';
  const leaderboardKey = `memory_game_leaderboard_${difficulty}`;
  const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];

  leaderboard.push({ time, moves, score });
  leaderboard.sort((a, b) => a.time - b.time || a.moves - b.moves);

  // Keep only top 10
  if (leaderboard.length > 10) leaderboard.length = 10;

  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const difficulty = localStorage.getItem('memory_game_difficulty') || 'easy';
  const leaderboardKey = `memory_game_leaderboard_${difficulty}`;
  const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];

  const lbContainer = document.getElementById('leaderboard');
  if (!lbContainer) return;

  lbContainer.innerHTML = '<h3>Leaderboard</h3>';
  if (leaderboard.length === 0) {
    lbContainer.innerHTML += '<p>No records yet.</p>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Rank</th><th>Time (s)</th><th>Moves</th><th>Score</th></tr>`;

  leaderboard.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.time}</td>
      <td>${entry.moves}</td>
      <td>${entry.score}</td>
    `;
    table.appendChild(row);
  });

  lbContainer.appendChild(table);
}

// Attach powerup button handlers if exist
const revealBtn = document.getElementById('revealBtn');
if (revealBtn) revealBtn.addEventListener('click', revealAll);

const shuffleBtn = document.getElementById('shuffleBtn');
if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleUnmatched);

const backBtn = document.getElementById('backBtn');
if (backBtn) backBtn.addEventListener('click', () => {
  window.location.href = 'memory_setup.html';
});

// Initialize game on load
window.onload = () => {
  startGame();
};

