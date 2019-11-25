const BACKGROUND_SIZE = 9558,
  START_MONSTERS_COUNT = 3,
  GAME_WIDTH = document.documentElement.clientWidth,
  WEAPON_AND_KNIGHT_GAP = 70,
  SWORDS_TRIO_DURATION = 18000,
  SWORDS_HAIL_DURATION = 2600;

const startPage = document.querySelector('.screen-start'),
  startForm = startPage.querySelector('form'),
  nameField = startForm.querySelector('.start-name'),
  startButton = startForm.querySelector('.start-submit'),
  gamePage = document.querySelector('.screen-game'),
  scoreElement = gamePage.querySelector('.kills-value'),
  userInfo = gamePage.querySelector('.game-panel-user');
  nameInfo = userInfo.querySelector('.user-info'),
  pauseModal = gamePage.querySelector('.pause'),
  skillsWrapper = gamePage.querySelector('.game-panel-skills');
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
    template: ``
  },
  block: {
    key: '2',
    rechargeTime: 0,
    magicLevelConsumption: 5,
    damage: 0,
    iconURL: 'assets/img/skill-shield.png',
    template: ``
  },
  swordsTrio: {
    key: '3',
    rechargeTime: 3000,
    magicLevelConsumption: 10,
    damage: 40,
    iconURL: 'assets/img/skill-sword-3.png',
    template: `<div class="swords-trio"></div>`
  },
  swordsHail: {
    key: '4',
    rechargeTime: 15000,
    magicLevelConsumption: 30,
    damage: 100,
    iconURL: 'assets/img/skill-sword-8.png',
    template: `<img class="swords-hail" src="assets/img/swords-hail.gif"></img>`
  },
}

const indicatorsDefaultData = {
  xp: {
    type: 'xp',
    color: '#9f000a',
    level: 100
  },
  mp: {
    type: 'mp',
    color: '#004bb8',
    level: 100
  }
}

const knightDefaultData = {
  className: 'knight',
  width: 72,
  height: 85,
  speed: 1.5,
  healthLevel: 100,
  magicLevel: 100,
  startPos: 9,
  runGif: 'url(./assets/img/run.gif)',
  idleGif: 'url(./assets/img/idle.gif)',
  blockGif: 'url(./assets/img/block.gif)',
  isBack: false
}

const monsterTypesArr = Object.keys(Monster);
const weaponTypesArr = Object.keys(Weapon);
const indicatorTypesArr = Object.keys(indicatorsDefaultData);

const monstersData = [];
const skillsData = {};
let indicatorsData = {};
let knightData = {};

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
    
    createStartData();
    renderAllObjects();
  }  
}

function createStartData() {
  createKnightData();
  createMonstersData(START_MONSTERS_COUNT);
  createSkillsData();
  createIndicatorsData();
}

function renderAllObjects() {
  renderKnight();  
  renderMonsters();
  renderSkills();
  renderIndicators();
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
    blockGif: knightDefaultData.blockGif,
    isMoving: false
  }
}

function renderKnight() {
  const knight = new Knight(knightData);
  gamePage.append(knight.render());

  document.addEventListener('keydown', onKnightKeyDown);
  document.addEventListener('keyup', onKnightKeyUp);

  requestAnimationFrame(moveKnight);

  function onKnightKeyDown(evt) {
    switch (evt.key) {
      case 'ArrowLeft':
        knightData.isBack = true;        
        knightData.isMoving = true;
        break;
      case 'ArrowRight':
        knightData.isBack = false;        
        knightData.isMoving = true;
        break;
    }
  }

  function onKnightKeyUp(evt) {
    if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
      knight.stop();
      knightData.isMoving = false;
    }
  } 

  function moveKnight() {
    if (knightData.isMoving) {
      changeKnightPosition();

      if (isKnightInTheMiddle()) {
        moveBackground();
        knightData.speed = 0;
      }

      if (settings.backgroundPosition === 0 || settings.backgroundPosition === BACKGROUND_SIZE) {
        knightData.speed = knightDefaultData.speed;
      }
      
      knightData.isMoving = true;
      knight.isBack = knightData.isBack;
      knight.move(knightData.position);
    }

    requestAnimationFrame(moveKnight);
  }

  function changeKnightPosition() {
    if (knightData.isBack) {
      knightData.position -= knightData.speed;
    } else {
      knightData.position += knightData.speed;
    }

    if (knightData.position < 0) {
      knightData.position = 0;
    }
  }
}

function isKnightInTheMiddle() {
  return knightData.position === GAME_WIDTH / 2 - knightData.width;
}

function moveBackground() {
  if (settings.backgroundPosition > 0 && settings.backgroundPosition <= BACKGROUND_SIZE) {
    settings.backgroundPosition += knightData.isBack ? settings.speed : -settings.speed;
  }
  
  gamePage.style.backgroundPosition = `${settings.backgroundPosition}px 0`;
}

function createMonstersData(count) {
  for (let i = 0; i < count; i++) {
    const type = getRandomMonsterType();
    const monsterDefaultData = Monster[type];
    monstersData.push({
      id: i,
      type: type,
      className: monsterDefaultData.className,
      damage: monsterDefaultData.damage,
      healthLevel: monsterDefaultData.healthLevel,
      speed: monsterDefaultData.speed,
      width: monsterDefaultData.width,
      height: monsterDefaultData.height,
      runGif: monsterDefaultData.runGif,
      position: getMonsterStartPosition(),
      isBack: false,
      isMoving: true
    });
  }  
}

function renderMonsters() {
  monstersData.forEach(monsterData => {
    const monster = new Enemy(monsterData);
    gamePage.append(monster.render());

    requestAnimationFrame(moveMonster);

    function moveMonster() {
      if (settings.isStarted) {
        changeMonsterDirection();
        changeMonsterPosition();
        changeMonsterSpeed();
        
        monster.move(monsterData.position);

        requestAnimationFrame(moveMonster);
      }
    }

    function changeMonsterDirection() {
      if (monsterData.position < knightData.position) {
        monsterData.isMoving = true;
        monsterData.isBack = true;
      } else if (monsterData.position > knightData.position + knightData.width) {
        monsterData.isMoving = true;
        monsterData.isBack = false;
      } else {
        monsterData.isMoving = false;
      }

      monster.isBack = monsterData.isBack;
    }

    function changeMonsterPosition() {
      if (monsterData.isMoving) {
        if (monsterData.isBack) {
          monsterData.position += monsterData.speed;
        } else {
          monsterData.position -= monsterData.speed;
        }
      }      
    }
    
    function changeMonsterSpeed() {
      if (isKnightInTheMiddle() && knightData.isMoving) {
        if (knightData.isBack) {
          const difference = monsterData.position >= GAME_WIDTH / 2 + monsterData.width ? -knightDefaultData.speed : knightDefaultData.speed;
          monsterData.speed = Monster[monsterData.type].speed + difference;
        } else {
          const difference = monsterData.position <= GAME_WIDTH / 2 - monsterData.width ? -knightDefaultData.speed : knightDefaultData.speed;
          monsterData.speed = Monster[monsterData.type].speed + difference;
        }
      } else {
        monsterData.speed = Monster[monsterData.type].speed;
      }
    }

    function damageMonster() {
      
    }

    function isMonsterDamagedBySwordsHail() {
      const swordsHailElement = gamePage.querySelector('.swords-hail');
      
      return isMonsterDamaged(swordsHailElement);
    }

    function isMonsterDamagedBySwordsTrio() {
      const allSwordsTrioElements = gamePage.querySelectorAll('.swords-trio');

      return allSwordsTrioElements.some(element => isMonsterDamaged(element));
    }

    function isMonsterDamaged(skill) {
      const skillCoords = skill.getBoundingClientRect();
      return monsterData.position <= skillCoords.right && monsterData.position + monsterData.width >= skillCoords.left;
    }

    // function damageKnight() {
    //   if (!skillsData["block"].isActive) {
    //     // код 
    //   }
    // }
  });
}

function createSkillsData() {
  for (key in Weapon) {
    skillsData[key] = Object.assign({}, Weapon[key]);
    skillsData[key].isActive = false;
    skillsData[key].isAvailable = true;
    skillsData[key].name = key;
  }
}

function setSkillAvailability(skill, isAvailable) {
  skillsData[skill].isAvailable = isAvailable;
}

function renderSkills() {
  weaponTypesArr.forEach(type => {
    const skill = new Skill(skillsData[type]);
    skillsWrapper.append(skill.render());

    document.addEventListener('keydown', onSkillsKeyDown);

    function onSkillsKeyDown(evt) {
      if (evt.key === skillsData[type].key) {
        if (skillsData[type].key === skillsData["swordsHail"].key) {
          useSwordsHail(knightData.isBack);
        }

        if (skillsData[type].key === skillsData["swordsTrio"].key) {
          useSwordsTrio(knightData.isBack);
        }

        skill.activate(setSkillAvailability);
        skillsData[type].isActive = true;
      }
    }
  });
}

function useSwordsHail(isBack) {
  if (skillsData["swordsHail"].isAvailable) {
    const skillDisplay = createElement(skillsData["swordsHail"].template);

    let position = setSkillDisplayPosition(isBack, skillDisplay);
    skillDisplay.style.left = `${position}px`;

    gamePage.append(skillDisplay);

    setTimeout(() => {skillDisplay.remove()}, SWORDS_HAIL_DURATION);
  }  
}

function useSwordsTrio(isBack) {
  if (skillsData["swordsTrio"].isAvailable) {
    const skillDisplay = createElement(skillsData["swordsTrio"].template);

    let position = setSkillDisplayPosition(isBack, skillDisplay);
    skillDisplay.style.left = `${position}px`;

    gamePage.append(skillDisplay);

    requestAnimationFrame(moveSwordsTrio);
    setTimeout(() => {skillDisplay.remove()}, SWORDS_TRIO_DURATION);

    function moveSwordsTrio() {
      if (skillDisplay && settings.isStarted) {
        if (isBack) {
          position -= settings.speed;
        } else {
          position += settings.speed;
        }
        
        skillDisplay.style.left = `${position}px`;

        requestAnimationFrame(moveSwordsTrio);
      }
    }
  }  
}

function setSkillDisplayPosition(isBack, skillDisplay) {
  let x = knightData.position;
  if (isBack) {
    x -= skillDisplay.clientWidth + WEAPON_AND_KNIGHT_GAP * 2;
    skillDisplay.style.transform = 'scale(-1, 1)';
  } else {
    x += WEAPON_AND_KNIGHT_GAP;
    skillDisplay.style.transform = 'none';
  }

  return x;
}

function createIndicatorsData() {
  indicatorsData = Object.assign({}, indicatorsDefaultData);
}

function renderIndicators() {
  indicatorTypesArr.forEach(type => {
    const indicator = new Indicator(indicatorsData[type]);
    userInfo.append(indicator.render());
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
    this._element = null;
    this._isMoving = props.isMoving;
    this._isBack = props.isBack;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;
    this._magicLevel = props.magicLevel;
    this._position = props.position;
    this._className = props.className; 
    this._width = props.width;
    this._height = props.height;
    this._runGif = props.runGif;
    this._idleGif = props.idleGif;
  }

  _changeDirection() {
    if (this._isBack) {
      this._element.style.transform = 'scale(-1, 1)';
    } else {
      this._element.style.transform = 'none';
    }
  }

  set isBack(value) {
    if (typeof value === 'boolean') {
      this._isBack = value;
    }
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

  move(newPos) {
    this._position = newPos;
    this._element.style.left = `${this._position}px`;
    this.isMoving = true;
    this._element.style.backgroundImage = this._runGif;
    this._changeDirection();
  }

  stop() {
    this.isMoving = false;
    this._element.style.backgroundImage = this._idleGif;
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

  _changeDirection() {
    if (this._isBack) {
      this._element.style.transform = 'scale(-1, 1)';
    } else {
      this._element.style.transform = 'none';
    }
  }

  set isBack(value) {
    if (typeof value === 'boolean') {
      this._isBack = value;
    }
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

  move(newPos) {
    this._position = newPos;
    this._element.style.left = `${this._position}px`;
    this.isMoving = true;
    this._changeDirection();
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
  
  _recharge(callback) {
    this._element.style.filter = 'none';
    this._isAvailable = true;
    callback(this._name, this._isAvailable);
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

  activate(callback) {
    if (this._isAvailable) {
      this._isAvailable = false;
      callback(this._name, this._isAvailable);

      this._element.style.filter = 'grayscale(1)';

      setTimeout(this._recharge, this._rechargeTime, callback);
    }
  }
}

class Indicator {
  constructor(props) {
    this._color = props.color;
    this._level = props.level;
    this._type = props.type;
  }

  get template() {
    return (
      `<div class="panel-${this._type}">
        <div class="score-value">
          <span>${this._level}</span>
        </div>
      </div>`
    );
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender() {
    this._element.remove();
    this._element = null;
  }

  decrease(value) {
    this._level -= value;
    this._element.firstChild.style.background = `linear-gradient(90deg, ${this._color} ${this._level}%, rgba(255,255,255,1) ${this._level}%)`;
  }
}