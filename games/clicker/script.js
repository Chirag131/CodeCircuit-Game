let clicks = 0;
let clickPower = 1;
let autoClickers = 0;
let cps = 0;

const clickDisplay = document.getElementById('clicks');
const cpsDisplay = document.getElementById('cps');
const clickBox = document.getElementById('click-box');

const upgradeClickPowerBtn = document.getElementById('upgrade-click-power');
const buyAutoClickerBtn = document.getElementById('buy-auto-clicker');

const costClickPowerDisplay = document.getElementById('cost-click-power');
const costAutoClickerDisplay = document.getElementById('cost-auto-clicker');

const storyBox = document.getElementById('story-box');
let milestonesReached = [];

let upgradeClickPowerCost = 10;
let autoClickerCost = 50;

// Sounds
const forgeSound = document.getElementById('sound-forge');
const coinsSound = document.getElementById('sound-coins');

function updateDisplay() {
  clickDisplay.textContent = Math.floor(clicks);
  cpsDisplay.textContent = cps.toFixed(1);
  costClickPowerDisplay.textContent = upgradeClickPowerCost;
  costAutoClickerDisplay.textContent = autoClickerCost;
}

function showStory(message) {
  storyBox.textContent = message;
  storyBox.style.display = 'block';
  setTimeout(() => { storyBox.style.display = 'none'; }, 5000);
}

clickBox.onclick = () => {
  clicks += clickPower;
  updateDisplay();

  // Play forge hammering sound on click
  if (forgeSound) {
    forgeSound.currentTime = 0;
    forgeSound.play();
  }

  // Pulse animation on click box
  clickBox.classList.add('pulse');
  setTimeout(() => clickBox.classList.remove('pulse'), 600);

  // Shimmer animation on gold count
  clickDisplay.classList.add('shimmer');
  setTimeout(() => clickDisplay.classList.remove('shimmer'), 1000);

  checkMilestones();
};

upgradeClickPowerBtn.onclick = () => {
  if (clicks >= upgradeClickPowerCost) {
    clicks -= upgradeClickPowerCost;
    clickPower += 1;
    upgradeClickPowerCost = Math.floor(upgradeClickPowerCost * 1.7);
    updateDisplay();

    // Play coins clinking sound on upgrade
    if (coinsSound) {
      coinsSound.currentTime = 0;
      coinsSound.play();
    }

    checkMilestones();
  }
};

buyAutoClickerBtn.onclick = () => {
  if (clicks >= autoClickerCost) {
    clicks -= autoClickerCost;
    autoClickers += 1;
    autoClickerCost = Math.floor(autoClickerCost * 1.7);
    updateCPS();
    updateDisplay();

    // Play coins clinking sound on upgrade
    if (coinsSound) {
      coinsSound.currentTime = 0;
      coinsSound.play();
    }

    checkMilestones();
  }
};

function updateCPS() {
  cps = autoClickers * clickPower;
  cpsDisplay.textContent = cps.toFixed(1);
}

// Auto clicker loop
setInterval(() => {
  clicks += cps / 10;
  updateDisplay();
  checkMilestones();
}, 100);

function checkMilestones() {
  const milestones = [
    { id: 1, condition: () => clicks >= 10, message: "You’ve built a clicking machine powered by raw determination." },
    { id: 2, condition: () => clickPower >= 2, message: "Your clicks are stronger. You’re onto something." },
    { id: 3, condition: () => autoClickers >= 1, message: "You create a robot that clicks for you. Sleep is optional now." },
    { id: 4, condition: () => cps >= 100, message: "The city lets you tap into the grid. You’re on the map." },
    { id: 5, condition: () => autoClickers >= 10, message: "Your machines are getting... smarter." },
    { id: 6, condition: () => autoClickers >= 25, message: "The world runs on your tech now." }
  ];

  for (const m of milestones) {
    if (!milestonesReached.includes(m.id) && m.condition()) {
      milestonesReached.push(m.id);
      showStory(m.message);
    }
  }
}

updateDisplay();
updateCPS();
