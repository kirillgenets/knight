const BACKGROUND_SIZE = 9558;
const START_MONSTERS_COUNT = 3;

const startPage = document.querySelector('.screen-start'),
  startForm = startPage.querySelector('form'),
  nameField = startForm.querySelector('.start-name'),
  startButton = startForm.querySelector('.start-submit'),
  gamePage = document.querySelector('.screen-game'),
  scoreElement = gamePage.querySelector('.kills-value'),
  nameInfo = gamePage.querySelector('.user-info'),
  pauseModal = gamePage.querySelector('.pause'),
  healthContainer = gamePage.querySelector('.panel-xp .score-value'),
  healthContainerValue = healthContainer.querySelector('span'),
  timeElement = gamePage.querySelector('.timer-value'),
  rankingPage = document.querySelector('.screen-ranking'),
  rankingTable = rankingPage.querySelector('.ranking-table'),
  playAgainButton = rankingPage.querySelector('.play-again');

const settings = {
  username: 'user',
  isStarted: false,
  startTime: '',
  pauseTime: '',
  backgroundPosition: BACKGROUND_SIZE,
  speed: 1.5,
  time: '',
  score: 0
}

const Monster = {
  dog: {
    className: 'monster-dog',
    damage: 2,
    healthLevel: 15,
    speed: 0.7
  },
  elf: {
    className: 'monster-elf',
    damage: 5,
    healthLevel: 30,
    speed: 0.5
  },
  grinch: {
    className: 'monster-grinch',
    damage: 10,
    healthLevel: 60,
    speed: 0.2
  }
};

const monsterTypesArr = Object.keys(Monster);

rankingPage.classList.add('hidden');

nameField.addEventListener('input', onNameFieldInput);
startForm.addEventListener('submit', onStartFormSubmit);

function onNameFieldInput() {  
  startButton.disabled = nameField.value !== '' ? false : true;
}

function onStartFormSubmit(evt) {
  evt.preventDefault();
  settings.username = nameField.value;
  initGame();
}

// ИГРОВЫЕ ФУНКЦИИ

function initGame() {
  if (!settings.isStarted) {
    settings.isStarted = true;

    startPage.classList.add('hidden');
    nameInfo.textContent = settings.username;

    createMonsters(START_MONSTERS_COUNT);
  }  
}

function createMonsters(count) {
  for (let i = 0; i < count; i++) {
    const monster = new Enemy(Monster[getRandomMonsterType()]);
    monster.draw(gamePage, getMonsterStartPosition());
  }  
}

function getRandomMonsterType() {  
  return monsterTypesArr[Math.floor(Math.random() * monsterTypesArr.length)];
}

function getMonsterStartPosition() {
  return Math.random() * (gamePage.clientWidth - gamePage.clientWidth / 2) + gamePage.clientWidth / 2;
}

// КЛАССЫ

class Enemy {
  constructor(props) {
    this.damage = props.damage;
    this.back = false;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;    
    this._className = props.className;
  }

  draw(container, startPos) {
		const monsterElement = document.createElement('div');
    monsterElement.classList.add(this._className);
    monsterElement.classList.add('monster');

    this.x = startPos;
    monsterElement.style.left = `${this.x}px`;
    
    container.appendChild(monsterElement);
  }
}
  