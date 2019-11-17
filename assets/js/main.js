const BACKGROUND_SIZE = 9558,
  START_MONSTERS_COUNT = 3;

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
    runGif: 'url(assets/img/dog-run.gif)'
  },
  elf: {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    healthLevel: 30,
    speed: 0.5,
    runGif: 'url(assets/img/elf-run.gif)'
  },
  grinch: {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    healthLevel: 60,
    speed: 0.2,
    runGif: 'url(assets/img/grinch-run.gif)'
  }
};

const Weapon = {
  sword: {
    key: '1',
    rechargeTime: 0,
    magicLevelConsumption: 0,
    damage: 15,
    iconURL: 'assets/img/skill-sword.png',
    template: ``,
  },
  block: {
    key: '2',
    rechargeTime: 0,
    magicLevelConsumption: 5,
    damage: 0,
    iconURL: 'assets/img/skill-shield.png',
    template: ``,
  },
  swordsTrio: {
    key: '3',
    rechargeTime: 3000,
    magicLevelConsumption: 10,
    damage: 40,
    iconURL: 'assets/img/skill-sword-3.png',
    template: ``,
  },
  swordsHail: {
    key: '4',
    rechargeTime: 15000,
    magicLevelConsumption: 30,
    damage: 100,
    iconURL: 'assets/img/skill-sword-8.png',
    template: `<img class="swords-hail" src="assets/img/swords-hail.gif"></img>`,
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
  runGif: 'url(assets/img/run.gif)',
  idleGif: 'url(assets/img/idle.gif)',
  blockGif: 'url(assets/img/block.gif)'
}

const monsterTypesArr = Object.keys(Monster);
const weaponTypesArr = Object.keys(Weapon);

const monstersData = [];
const skillsData = {};
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

    // function damageKnight() {
    //   if (!skillsData["block"].active) {
    //     // код 
    //   }
    // }
  });
}

function createSkillsData() {
  for (key in Weapon) {
    skillsData[key] = Object.assign({}, Weapon[key]);
    skillsData[key].active = false;
  }
}

function renderSkills() {
  weaponTypesArr.forEach(type => {
    const skill = new Skill(skillsData[type]);
    skillsWrapper.append(skill.render());

    document.addEventListener('keydown', onSkillsKeyDown);

    function onSkillsKeyDown(evt) {
      if (evt.key === skillsData[type].key) {
        skill.activate();
        skillsData[type].active = true;
      }

      if (skillsData[type].key === skillsData["swordsHail"].key) {
        useSwordsHail();
      }
    }

    function useSwordsHail() {
      const skillDisplay = createElement(skillsData["swordsHail"].template);
      skillDisplay.style.left = `${knightData.position}px`;

      gamePage.append(skillDisplay);

      setTimeout(() => {skillDisplay.remove()}, 2600);
    }
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

  get element() {
    return this._element;
  }

  get template() {
    return `<div class="${this._className}"></div>`;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender(container) {
    container.remove(this._element);
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

  get element() {
    return this._element;
  }

  get template() {
    return `<div class="${this._className} monster" style="left: ${this._position}px"></div>`;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender() {
    this._element.remove();
    this._element = null;
  }
}

class Skill {
  constructor(props) {
    this._name = props.name;
    this._rechargeTime = props.rechargeTime;
    this._damage = props.damage;
    this._iconURL = props.iconURL;
    this._isAvailable = true;
    this._element = null;
    this._recharge = this._recharge.bind(this);
  }
  
  _recharge() {
    this._element.style.filter = 'none';
    this._isAvailable = true;
  }

  get template() {
    return `<img src="${this._iconURL}" alt="skill">`;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender() {
    this._element.remove();
    this._element = null;
  }

  activate() {
    if (this._isAvailable) {
      this._isAvailable = false;
      this._element.style.filter = 'grayscale(1)';

      setTimeout(this._recharge, this._rechargeTime);
    }
  }
}
