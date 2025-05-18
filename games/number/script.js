let maxNumber = parseInt(localStorage.getItem("maxNumber")) || 100;
let attempts = maxNumber === 50 ? 10 : maxNumber === 100 ? 7 : 5;
let randomNumber = Math.floor(Math.random() * maxNumber) + 1;

document.addEventListener("DOMContentLoaded", () => {
  const rangeDisplay = document.getElementById("range-display");
  if (rangeDisplay) {
    rangeDisplay.textContent = `Guess a number between 1 and ${maxNumber}`;
    document.getElementById("attempts").textContent = `Attempts Left: ${attempts}`;
  }
});

function checkGuess() {
  const input = document.getElementById("guessInput").value;
  const message = document.getElementById("message");
  const guess = parseInt(input);

  if (isNaN(guess)) {
    message.textContent = "❌ Please enter a valid number.";
    return;
  }

  if (guess < 1 || guess > maxNumber) {
    message.textContent = `❌ Number out of range! Please guess between 1 and ${maxNumber}.`;
    return;
  }

  attempts--;
  if (guess === randomNumber) {
    message.textContent = "🎉 Correct! You guessed the number!";
    disableInput();
  } else if (attempts === 0) {
    message.textContent = `❌ Game Over! The number was ${randomNumber}`;
    disableInput();
  } else {
    const diff = Math.abs(guess - randomNumber);
    let hint = guess > randomNumber ? "📉 Too high!" : "📈 Too low!";

    if (diff <= 3) {
      hint = "🔥 Very close! " + hint;
    } else if (diff <= 5) {
      hint = "🌡️ Close! " + hint;
    } else if (diff <= 10) {
      hint = "👌 Not far off. " + hint;
    }

    message.textContent = hint;
    document.getElementById("attempts").textContent = `Attempts Left: ${attempts}`;
  }
}

function disableInput() {
  document.getElementById("guessInput").disabled = true;
}

function resetGame() {
  location.reload();
}