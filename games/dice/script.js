const dice = document.getElementById('dice');
const result = document.getElementById('result');
const scoreEl = document.getElementById('score');
const rollCountEl = document.getElementById('roll-count');
const historyEl = document.getElementById('history');
const modeTitle = document.getElementById('mode-title');
const leaderboardContainer = document.getElementById('leaderboard-container');
const leaderboardList = document.getElementById('leaderboard');

let mode = localStorage.getItem('diceMode') || 'free';
let score = 0;
let rolls = 0;
let history = [];

const diceSound = new Audio('/games/dice/dice-roll.mp3');

window.onload = function () {
  if (mode === 'game') {
    scoreEl.style.display = 'block';
    rollCountEl.style.display = 'block';
    leaderboardContainer.style.display = 'block';
    modeTitle.textContent = "🎯 Game Mode: Race to 100";
    loadLeaderboard();
  } else {
    modeTitle.textContent = "🎲 Free Mode";
    scoreEl.style.display = 'none';
    rollCountEl.style.display = 'none';
    leaderboardContainer.style.display = 'none';
  }
};

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;

  diceSound.currentTime = 0;
  diceSound.play();

  dice.classList.add('animate');
  dice.src = `/games/dice/images/dice${roll}.png`;
  setTimeout(() => {
    dice.classList.remove('animate');
  }, 500);

  result.textContent = `You rolled a ${roll}`;
  history.unshift(roll);
  if (history.length > 5) history.pop();
  updateHistory();

  if (mode === 'game') {
    rolls++;
    rollCountEl.textContent = `Rolls: ${rolls}`;
    score += roll;

    if (score > 100) {
      result.textContent = `You rolled ${roll}. You went over 100! 😓 Try again.`;
      resetCurrentGame();
    } else if (score === 100) {
      result.textContent = `🎉 You reached 100 in ${rolls} rolls!`;
      saveToLeaderboard(rolls);
      resetCurrentGame();
    }

    scoreEl.textContent = `Score: ${score}`;
  }
}

function updateHistory() {
  historyEl.innerHTML = "";
  history.forEach((num, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1}: ${num}`;
    historyEl.appendChild(li);
  });
}

function resetCurrentGame() {
  score = 0;
  rolls = 0;
  scoreEl.textContent = `Score: ${score}`;
  rollCountEl.textContent = `Rolls: ${rolls}`;
}

function goBack() {
  window.location.href = 'dice_setup.html';
}

function saveToLeaderboard(rollsTaken) {
  let leaderboard = JSON.parse(localStorage.getItem("diceLeaderboard")) || [];
  leaderboard.push(rollsTaken);
  leaderboard.sort((a, b) => a - b); // smallest first
  leaderboard = leaderboard.slice(0, 5); // Top 5
  localStorage.setItem("diceLeaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

function loadLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("diceLeaderboard")) || [];
  leaderboardList.innerHTML = "";
  leaderboard.forEach((rolls, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${rolls} rolls`;
    leaderboardList.appendChild(li);
  });
}

function resetGame() {
  if (confirm("Reset current game and leaderboard?")) {
    localStorage.removeItem("diceLeaderboard");
    resetCurrentGame();
    leaderboardList.innerHTML = "";
    history = [];
    updateHistory();
    result.textContent = "";
  }
}

// Allow clicking on the dice to roll it
dice.addEventListener('click', rollDice);
