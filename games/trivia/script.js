// script.js

// Globals
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedCategory = 'math';  // default category
let selectedDifficulty = 'easy'; // default difficulty
let timerDuration = 20; // seconds per question
let timer;
let timeLeft;
let lifelines = {
  fiftyFifty: true,
  skip: true,
  extraTime: true,
};
let darkMode = false;

// Cache DOM elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const lifeline50Btn = document.getElementById('lifeline-50');
const lifelineSkipBtn = document.getElementById('lifeline-skip');
const lifelineExtraBtn = document.getElementById('lifeline-extra');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const nextBtn = document.getElementById('next-btn');
const scoreboardEl = document.getElementById('scoreboard');
const summaryEl = document.getElementById('summary');
const quizContainer = document.getElementById('quiz-container');

document.getElementById('back-to-setup').addEventListener('click', () => {
  window.location.href = 'trivia_setup.html';
});


// Helper to get URL query params
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || 'math',
    difficulty: params.get('difficulty') || 'easy',
  };
}

function init() {
  // Load questions from data.js for selected category and difficulty
  if (!questionsData[selectedCategory] || !questionsData[selectedCategory][selectedDifficulty]) {
    selectedCategory = 'math';
    selectedDifficulty = 'easy';
  }

  questions = [...questionsData[selectedCategory][selectedDifficulty]];
  questions = shuffleArray(questions);

  currentQuestionIndex = 0;
  score = 0;
  lifelines = {
    fiftyFifty: true,
    skip: true,
    extraTime: true,
  };

  timeLeft = timerDuration;
  updateScoreboard();
  updateLifelineButtons();
  renderQuestion();
  startTimer();

  summaryEl.style.display = 'none';
  quizContainer.style.display = 'block';
}
function showSummary(score) {
  const summaryDiv = document.getElementById('summary');
  const lastScore = localStorage.getItem('lastQuizScore');
  
  let lastScoreText = '';
  if (lastScore !== null) {
    lastScoreText = `<div class="last-score-info">Your last quiz score: ${lastScore}</div>`;
  }

  summaryDiv.innerHTML = `
    <h2>Quiz Completed!</h2>
    <p>Your score: <strong>${score}</strong></p>
    ${lastScoreText}
    <div class="summary-buttons">
      <button id="restart-btn">Play Again</button>
      <button id="back-btn">Back to Menu</button>
    </div>
  `;

  summaryDiv.style.display = 'block';

  localStorage.setItem('lastQuizScore', score);

  document.getElementById('restart-btn').addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'trivia_setup.html';
  });


}




function renderQuestion() {
  const currentQ = questions[currentQuestionIndex];
  questionEl.textContent = currentQ.question;
  optionsEl.innerHTML = '';

  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = opt;
    btn.dataset.index = idx;
    btn.addEventListener('click', () => selectAnswer(idx));
    optionsEl.appendChild(btn);
  });

  timeLeft = timerDuration;
  updateTimerDisplay();
  nextBtn.style.display = 'none';
}

function selectAnswer(selectedIdx) {
  stopTimer();
  const currentQ = questions[currentQuestionIndex];
  const correctIdx = currentQ.correctIndex;

  Array.from(optionsEl.children).forEach(btn => btn.disabled = true);

  if (selectedIdx === correctIdx) {
    score++;
    optionsEl.children[selectedIdx].classList.add('correct');
  } else {
    optionsEl.children[selectedIdx].classList.add('wrong');
    optionsEl.children[correctIdx].classList.add('correct');
  }

  updateScoreboard();
  nextBtn.style.display = 'inline-block';
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    showSummary();
  } else {
    renderQuestion();
    startTimer();
  }
}

function startTimer() {
  timerEl.style.color = '#000';
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 5) {
      timerEl.style.color = 'red';
    }
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableOptions();
      revealCorrectAnswer();
      nextBtn.style.display = 'inline-block';
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function updateTimerDisplay() {
  timerEl.textContent = `Time: ${timeLeft}s`;
}

function disableOptions() {
  Array.from(optionsEl.children).forEach(btn => btn.disabled = true);
}

function revealCorrectAnswer() {
  const currentQ = questions[currentQuestionIndex];
  const correctIdx = currentQ.correctIndex;
  optionsEl.children[correctIdx].classList.add('correct');
}

function useFiftyFifty() {
  if (!lifelines.fiftyFifty) return;
  lifelines.fiftyFifty = false;

  const currentQ = questions[currentQuestionIndex];
  const correctIdx = currentQ.correctIndex;

  const buttons = Array.from(optionsEl.children);
  const wrongButtons = buttons.filter(btn => parseInt(btn.dataset.index) !== correctIdx && !btn.disabled);

  let removed = 0;
  while (removed < 2 && wrongButtons.length > 0) {
    const randomIndex = Math.floor(Math.random() * wrongButtons.length);
    const btnToRemove = wrongButtons.splice(randomIndex, 1)[0];
    btnToRemove.disabled = true;
    btnToRemove.classList.add('disabled-option');
    removed++;
  }

  updateLifelineButtons();
}

function useSkip() {
  if (!lifelines.skip) return;
  lifelines.skip = false;
  stopTimer();
  nextQuestion();
  updateLifelineButtons();
}

function useExtraTime() {
  if (!lifelines.extraTime) return;
  lifelines.extraTime = false;
  timeLeft += 15;
  updateTimerDisplay();
  updateLifelineButtons();
}

function updateLifelineButtons() {
  lifeline50Btn.disabled = !lifelines.fiftyFifty;
  lifelineSkipBtn.disabled = !lifelines.skip;
  lifelineExtraBtn.disabled = !lifelines.extraTime;
}

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  darkModeToggle.innerHTML = darkMode ? '☀️' : '🌙';
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function updateScoreboard() {
  let displayedScore = parseInt(scoreEl.textContent) || 0;
  if (score > displayedScore) {
    let incrementInterval = setInterval(() => {
      displayedScore++;
      scoreEl.textContent = displayedScore;
      if (displayedScore >= score) clearInterval(incrementInterval);
    }, 100);
  } else {
    scoreEl.textContent = score;
  }
}

function showSummary() {
  quizContainer.style.display = 'none';
  summaryEl.style.display = 'block';

  const total = questions.length;
  const percent = Math.round((score / total) * 100);

  summaryEl.innerHTML = `
    <h2>Quiz Complete!</h2>
    <p>Your Score: ${score} / ${total} (${percent}%)</p>
    ${percent === 100 ? '<p>Perfect Score! 🎉</p>' : ''}
    <button id="restart-btn">Restart Quiz</button>
    <button id="summary-back-btn" class="back-btn">Back to Setup</button>
  `;

  document.getElementById('restart-btn').addEventListener('click', () => {
    summaryEl.style.display = 'none';
    quizContainer.style.display = 'block';
  document.getElementById('summary-back-btn').addEventListener('click', () => {
  // Go back to setup page
    window.location.href = 'trivia_setup.html';
    
    init();
});
});
}

// Event listeners
lifeline50Btn.addEventListener('click', useFiftyFifty);
lifelineSkipBtn.addEventListener('click', useSkip);
lifelineExtraBtn.addEventListener('click', useExtraTime);
darkModeToggle.addEventListener('click', toggleDarkMode);
nextBtn.addEventListener('click', nextQuestion);

// On page load
window.addEventListener('DOMContentLoaded', () => {
  const params = getQueryParams();
  selectedCategory = params.category.toLowerCase();
  selectedDifficulty = params.difficulty.toLowerCase();

  // Validate category and difficulty
  if (!questionsData[selectedCategory]) selectedCategory = 'math';
  if (!questionsData[selectedCategory][selectedDifficulty]) selectedDifficulty = 'easy';

  init();
});
