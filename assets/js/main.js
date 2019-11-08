const BACKGROUND_SIZE = 9558;
const START_MONSTERS_COUNT = 3;
const KNIGHT_RUN_GIF_URL = 'url(assets/img/run.gif)';
const KNIGHT_IDLE_GIF_URL = 'url(assets/img/idle.gif)';
const KNIGHT_BLOCK_GIF_URL = 'url(assets/img/block.gif)';
const DOG_RUN_GIF_URL = 'url(assets/img/dog-run.gif)';
const ELF_RUN_GIF_URL = 'url(assets/img/elf-run.gif)';
const GRINCH_RUN_GIF_URL = 'url(assets/img/grinch-run.gif)';

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
    width: 64,
    height: 43,
    damage: 2,
    healthLevel: 15,
    speed: 0.7,
    runGif: DOG_RUN_GIF_URL
  },
  elf: {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    healthLevel: 30,
    speed: 0.5,
    runGif: ELF_RUN_GIF_URL
  },
  grinch: {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    healthLevel: 60,
    speed: 0.2,
    runGif: GRINCH_RUN_GIF_URL
  }
};

const knightDefaultData = {
  className: 'knight',
  width: 72,
  height: 85,
  speed: 1.5,
  healthLevel: 100,
  magicLevel: 100,
  startPos: 10,
  runGif: KNIGHT_RUN_GIF_URL,
  idleGif: KNIGHT_IDLE_GIF_URL,
  blockGif: KNIGHT_BLOCK_GIF_URL
}

const monsterTypesArr = Object.keys(Monster);

const monstersData = [];
let knightData = {};
let knight;

rankingPage.classList.add('hidden');

nameField.addEventListener('input', onNameFieldInput);
startForm.addEventListener('submit', onStartFormSubmit);

function onNameFieldInput() {  
  startButton.disabled = nameField.value === '' ? true : false;
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

    createKnightData();
    renderKnight();

    createMonstersData(START_MONSTERS_COUNT);
    renderMonsters();
  }  
}

// function playGame() {
//   if (settings.isStarted) {
//     moveMonsters();
//   }
// }

function createKnightData() {
  knightData = {
    className: knightDefaultData.className,
    healthLevel: knightDefaultData.healthLevel,
    magicLevel: knightDefaultData.magicLevel,
    speed: knightDefaultData.speed,
    width: knightDefaultData.width,
    height: knightDefaultData.height,
    position: knightDefaultData.startPos,
    runGif: knightDefaultData.runGif,
    idleGif: knightDefaultData.idleGif,
    blockGif: knightDefaultData.blockGif
  }
}

function renderKnight() {
  knight = new Knight(knightData);
  knight.draw(gamePage);
}

function createMonstersData(count) {
  for (let i = 0; i < count; i++) {
    const monsterDefaultData = Monster[getRandomMonsterType()];
    monstersData.push({
      id: i,
      className: monsterDefaultData.className,
      damage: monsterDefaultData.damage,
      healthLevel: monsterDefaultData.healthLevel,
      speed: monsterDefaultData.speed,
      width: monsterDefaultData.width,
      height: monsterDefaultData.height,
      runGif: monsterDefaultData.runGif,
      position: getMonsterStartPosition()  
    });
  }  
}

function renderMonsters() {
  monstersData.forEach(monsterData => {
    const monster = new Enemy(monsterData);
    monster.draw(gamePage);
  });
}

// function moveMonsters() {

// }

function getRandomMonsterType() {  
  return monsterTypesArr[Math.floor(Math.random() * monsterTypesArr.length)];
}

function getMonsterStartPosition() {
  return Math.random() * (gamePage.clientWidth - gamePage.clientWidth / 2) + gamePage.clientWidth / 2;
}

// КЛАССЫ

class Knight {
  constructor(props) {
    this.directions = {
      back: false,
      forward: false
    };
    this.speed = props.speed;
    this.healthLevel = props.healthLevel;
    this.magicLevel = props.magicLevel;
    this.position = props.position;
    this._className = props.className; 
    this._width = props.width;
    this._height = props.height;
  }

  draw(container) {
    const knightImage = document.createElement('div');
		knightImage.classList.add(this._className);
		container.appendChild(knightImage);
  }
}

class Enemy {
  constructor(props) {
    this.damage = props.damage;
    this.back = false;
    this.position = props.position;
    this._width = props.width;
    this._height = props.height;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;    
    this._className = props.className;
  }

  draw(container) {
		const monsterElement = document.createElement('div');
    monsterElement.classList.add(this._className);
    monsterElement.classList.add('monster');

    monsterElement.style.left = `${this.position}px`;
    
    container.appendChild(monsterElement);
  }

  go() {
    this.position -= this._speed;
  }
}
  