const BACKGROUND_SIZE = 9558,
  START_MONSTERS_COUNT = 3,
  KNIGHT_RUN_GIF_URL = 'url(assets/img/run.gif)',
  KNIGHT_IDLE_GIF_URL = 'url(assets/img/idle.gif)',
  KNIGHT_BLOCK_GIF_URL = 'url(assets/img/block.gif)',
  DOG_RUN_GIF_URL = 'url(assets/img/dog-run.gif)',
  ELF_RUN_GIF_URL = 'url(assets/img/elf-run.gif)',
  GRINCH_RUN_GIF_URL = 'url(assets/img/grinch-run.gif)',
  SKILL_SWORD_URL = 'assets/img/skill-sword.png',
  SKILL_BLOCK_URL = 'assets/img/skill-shield.png',
  SKILL_SWORDS_TRIO_URL = 'assets/img/skill-sword-3.png',
  SKILL_UNAVAILABLE_FILTER = 'grayscale(1)',
  SKILL_SWORDS_HAIL_URL = 'assets/img/skill-sword-8.png';

const startPage = document.querySelector('.screen-start'),
  startForm = startPage.querySelector('form'),
  nameField = startForm.querySelector('.start-name'),
  startButton = startForm.querySelector('.start-submit'),
  gamePage = document.querySelector('.screen-game'),
  scoreElement = gamePage.querySelector('.kills-value'),
  nameInfo = gamePage.querySelector('.user-info'),
  pauseModal = gamePage.querySelector('.pause'),
  skillsWrapper = gamePage.querySelector('.game-panel-skills');
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

const Weapon = {
  sword: {
    key: '1',
    rechargeTime: 0,
    magicLevelConsumption: 0,
    damage: 15,
    iconURL: SKILL_SWORD_URL,
    unavailableFilter: SKILL_UNAVAILABLE_FILTER
  },
  block: {
    key: '2',
    rechargeTime: 0,
    magicLevelConsumption: 5,
    damage: 0,
    iconURL: SKILL_BLOCK_URL,
    unavailableFilter: SKILL_UNAVAILABLE_FILTER
  },
  swordsTrio: {
    key: '3',
    rechargeTime: 3,
    magicLevelConsumption: 10,
    damage: 40,
    iconURL: SKILL_SWORDS_TRIO_URL,
    unavailableFilter: SKILL_UNAVAILABLE_FILTER
  },
  swordsHail: {
    key: '4',
    rechargeTime: 15,
    magicLevelConsumption: 30,
    damage: 100,
    iconURL: SKILL_SWORDS_HAIL_URL,
    unavailableFilter: SKILL_UNAVAILABLE_FILTER
  },
}

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
const weaponTypesArr = Object.keys(Weapon);

const monstersData = [];
let skillsData = [];
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

    createSkillsData();
    renderSkills();
  }  
}

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
  gamePage.append(knight.render());
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
    gamePage.append(monster.render());
  });
}

function createSkillsData() {
  skillsData = Object.assign({}, Weapon);
}

function renderSkills() {
  weaponTypesArr.forEach(key => {
    const skill = new Skill(skillsData[key]);
    skillsWrapper.append(skill.render());
  });
}

function createElement(template) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = template;  
  
  return wrapper.firstChild;
}

function getRandomMonsterType() {  
  return monsterTypesArr[Math.floor(Math.random() * monsterTypesArr.length)];
}

function getMonsterStartPosition() {
  return Math.random() * (gamePage.clientWidth - gamePage.clientWidth / 2) + gamePage.clientWidth / 2;
}

// КЛАССЫ

class Knight {
  constructor(props) {
    this._isAttack = false;
    this._isMoving = false;
    this._isBack = false;
    this._element = null;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;
    this._magicLevel = props.magicLevel;
    this._position = props.position;
    this._className = props.className; 
    this._width = props.width;
    this._height = props.height;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender(container) {
    container.remove(this._element);
  }

  get element() {
    return this._element;
  }

  get template() {
    return `<div class="${this._className}"></div>`;
  }
}

class Enemy {
  constructor(props) {
    this._damage = props.damage;
    this._element = null;
    this._isAttack = false;
    this._isBack = false;
    this._position = props.position;
    this._width = props.width;
    this._height = props.height;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;    
    this._className = props.className;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender(container) {
    container.remove(this._element);
  }

  get element() {
    return this._element;
  }

  get template() {
    return `<div class="${this._className} monster" style="left: ${this._position}px"></div>`;
  }
}

class Skill {
  constructor(props) {
    this._rechargeTime = props.rechargeTime;
    this._damage = props.damage;
    this._iconURL = props.iconURL;
    this._unavailableFilter = props.unavailableFilter;
    this._isAvailable = true;
    this._isUsing = false;
    this._element = null;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender(container) {
    container.remove(this._element);
  }

  get template() {
    return `<img src="${this._iconURL}" alt="skill">`;
  }
}
  