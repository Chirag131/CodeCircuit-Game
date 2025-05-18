let playerScore = 0;
let computerScore = 0;
let ties = 0;
let roundsPlayed = 0;
let totalRounds = 5;
let difficulty = 'easy';
let lastPlayerMove = null;

const scoreBoard = document.getElementById("score");
const resultText = document.getElementById("result");
const historyList = document.getElementById("historyList");
const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");

// Load settings from sessionStorage
window.onload = function () {
  const savedRounds = sessionStorage.getItem("rpsRounds");
  const savedDifficulty = sessionStorage.getItem("rpsDifficulty");

  if (savedRounds) totalRounds = parseInt(savedRounds);
  if (savedDifficulty) difficulty = savedDifficulty;

  loadScores();
  updateScore();

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") play("rock");
    if (e.key.toLowerCase() === "p") play("paper");
    if (e.key.toLowerCase() === "s") play("scissors");
  });
};

function play(playerChoice) {
  if (roundsPlayed >= totalRounds) return;

  const computerChoice = difficulty === 'easy'
    ? getRandomChoice()
    : getCounterChoice(lastPlayerMove);

  animateChoice(playerDisplay, "You", playerChoice);
  animateChoice(computerDisplay, "Computer", computerChoice);

  lastPlayerMove = playerChoice;

  setTimeout(() => {
    determineWinner(playerChoice, computerChoice);
  }, 700);
}

function getRandomChoice() {
  const choices = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * 3)];
}

function getCounterChoice(userChoice) {
  const counterMap = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
  };
  if (!userChoice) return getRandomChoice();
  return counterMap[userChoice];
}

function animateChoice(container, label, choice) {
  const emoji = choice === "rock" ? "✊" : choice === "paper" ? "✋" : "✌️";
  container.className = "throw";
  container.innerHTML = `<strong>${label}:</strong> ${emoji}`;
  setTimeout(() => container.classList.remove("throw"), 500);
}

function determineWinner(player, computer) {
  let result;
  roundsPlayed++;

  if (player === computer) {
    result = "It's a draw!";
    ties++;
  } else if (
    (player === "rock" && computer === "scissors") ||
    (player === "scissors" && computer === "paper") ||
    (player === "paper" && computer === "rock")
  ) {
    result = "You win!";
    playerScore++;
  } else {
    result = "Computer wins!";
    computerScore++;
  }

  updateScore();
  resultText.textContent = result;
  updateHistory(player, computer, result);
  saveScores();

  if (roundsPlayed >= totalRounds) {
    setTimeout(() => showMatchResult(), 500);
  }
}

function updateScore() {
  scoreBoard.textContent = `Player: ${playerScore} | Computer: ${computerScore} | Ties: ${ties} | Round: ${roundsPlayed}/${totalRounds}`;
}

function updateHistory(player, computer, result) {
  const li = document.createElement("li");
  li.textContent = `You: ${player} | Computer: ${computer} → ${result}`;
  historyList.prepend(li);
  if (historyList.childElementCount > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}

function showMatchResult() {
  let message = '';
  if (playerScore > computerScore) {
    message = "🎉 You won the match!";
  } else if (computerScore > playerScore) {
    message = "😢 You lost the match!";
  } else {
    message = "🤝 It's a tie match!";
  }

  alert(message);
  resetGame();
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  ties = 0;
  roundsPlayed = 0;
  lastPlayerMove = null;

  scoreBoard.textContent = "Player: 0 | Computer: 0";
  resultText.textContent = "Make your move!";
  historyList.innerHTML = "";
  localStorage.removeItem("rpsScores");
  updateScore();
}

function saveScores() {
  localStorage.setItem("rpsScores", JSON.stringify({
    playerScore,
    computerScore,
    ties,
  }));
}

function loadScores() {
  const saved = JSON.parse(localStorage.getItem("rpsScores"));
  if (saved) {
    playerScore = saved.playerScore;
    computerScore = saved.computerScore;
    ties = saved.ties;
  }
}
