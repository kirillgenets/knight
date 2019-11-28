const BACKGROUND_SIZE = 9558,
  START_MONSTERS_COUNT = 3,
  WEAPON_AND_KNIGHT_GAP = 70,
  SWORDS_TRIO_DURATION = 18000,
  SWORDS_HAIL_DURATION = 2600,
  USER_NAME_TEMPLATE = '<div class="user-info"></div>',
  MONSTERS_ATTACK_SPEED = 1000
  INDICATORS_RECHARGE_TIME = 1000,
  IMG_PATH = './assets/img/';

const startPage = document.querySelector('.screen-start'),
  startForm = startPage.querySelector('form'),
  nameField = startForm.querySelector('.start-name'),
  startButton = startForm.querySelector('.start-submit'),
  gamePage = document.querySelector('.screen-game'),
  scoreElement = gamePage.querySelector('.kills-value'),
  userInfo = gamePage.querySelector('.game-panel-user');
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
    runGif: 'dog-run.gif'
  },
  elf: {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    healthLevel: 30,
    speed: 0.5,
    runGif: 'elf-run.gif'
  },
  grinch: {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    healthLevel: 60,
    speed: 0.2,
    runGif: 'grinch-run.gif'
  }
};

const Weapon = {
  sword: {
    key: '1',
    rechargeTime: 0,
    magicLevelConsumption: 0,
    damage: 15,
    iconURL: 'skill-sword.png'
  },
  block: {
    key: '2',
    rechargeTime: 0,
    magicLevelConsumption: 5,
    damage: 0,
    iconURL: 'skill-shield.png'
  },
  swordsTrio: {
    key: '3',
    rechargeTime: 3000,
    magicLevelConsumption: 10,
    damage: 40,
    iconURL: 'skill-sword-3.png'    
  },
  swordsHail: {
    key: '4',
    rechargeTime: 15000,
    magicLevelConsumption: 30,
    damage: 100,
    iconURL: 'skill-sword-8.png',    
  },
}

const skillDisplaysDefaultData = {
  swordsTrio: {
    width: 90,
    template: `<div class="swords-trio"></div>`,
    speed: 1.7
  },
  swordsHail: {
    width: 191,
    template: `<img class="swords-hail" src="assets/img/swords-hail.gif"></img>`,
    speed: 0
  }
}

const indicatorsDefaultData = {
  xp: {
    type: 'xp',
    color: '#9f000a',
    level: 100,
    rechargePerSecond: 2
  },
  mp: {
    type: 'mp',
    color: '#004bb8',
    level: 100,
    rechargePerSecond: 5
  }
}

const knightDefaultData = {
  className: 'knight',
  width: 72,
  height: 85,
  speed: 1.5,
  healthLevel: 100,
  startPos: 9,
  runGif: 'run.gif',
  idleGif: 'idle.gif',
  blockGif: 'block.gif',
  isBack: false
}

let gameWidth = document.documentElement.clientWidth;

const monsterTypesArr = Object.keys(Monster);
const weaponTypesArr = Object.keys(Weapon);
const indicatorTypesArr = Object.keys(indicatorsDefaultData);

const skillsData = {};
const monstersData = [];
const skillDisplaysData = [];
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
  renderAllMonsters();
  renderSkills();
  renderUserInfo();
}

function createKnightData() {
  knightData = {
    className: knightDefaultData.className,
    healthLevel: knightDefaultData.healthLevel,
    speed: knightDefaultData.speed,
    width: knightDefaultData.width,
    height: knightDefaultData.height,
    position: knightDefaultData.startPos,
    runGif: knightDefaultData.runGif,
    idleGif: knightDefaultData.idleGif,
    blockGif: knightDefaultData.blockGif,
    isMoving: false,
    isDamaged: false
  }
}

function renderKnight() {
  const knight = new Knight(knightData);
  gamePage.append(knight.render());

  knight.onRun = (evt) => {
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

  knight.onStop = (evt) => {
    if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
      knight.stop();
      knightData.isMoving = false;
    }
  }

  knight.bind();

  requestAnimationFrame(moveKnight);

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

    checkKnightForDamage();
    checkKnightForAliveness();

    requestAnimationFrame(moveKnight);
  }

  function checkKnightForDamage() {
    monstersData.forEach(monsterData => {
      if (isKnightDamaged(monsterData) && !monsterData.isAttack) {
        damageKnight(monsterData.damage);
        changeMonsterAttackStatus(monsterData);        
      }
    });
  }

  function checkKnightForAliveness() {
    if (knightData.healthLevel <= 0) {
      console.log('dead');
    }
  }

  function damageKnight(damage) {
    knightData.isDamaged = true;
    knightData.healthLevel -= damage; 

    indicatorsData["xp"].level = knightData.healthLevel;
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

function isKnightDamaged(monster) {
  if (monster.isAlive) {
    return knightData.position <= monster.position + monster.width && knightData.position + knightData.width >= monster.position;
  }
}

function isKnightInTheMiddle() {
  return knightData.position === gameWidth / 2 - knightData.width;
}

function moveBackground() {
  if (settings.backgroundPosition > 0 && settings.backgroundPosition <= BACKGROUND_SIZE) {
    settings.backgroundPosition += knightData.isBack ? settings.speed : -settings.speed;
  }
  
  gamePage.style.backgroundPosition = `${settings.backgroundPosition}px 0`;
}

function createMonstersData(count, startPos = getMonsterStartPosition()) {
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
      position: startPos,
      isBack: false,
      isMoving: true,
      isDamaged: false,
      isAttack: false,
      isAlive: true
    });
  }  
}

function renderAllMonsters() {
  monstersData.forEach(renderMonster);
}

function renderMonster(monsterData) {
  let monster = new Enemy(monsterData);
  gamePage.append(monster.render());

  requestAnimationFrame(moveMonster);

  function moveMonster() {
    if (settings.isStarted) {
      changeMonsterDirection();
      changeMonsterPosition();
      changeMonsterSpeed();
      checkMonsterForDamage();
      checkMonsterForAliveness();

      if (monster) {
        monster.move(monsterData.position);
        requestAnimationFrame(moveMonster);
      }        
    }
  }

  function changeMonsterDirection() {
    if (monsterData.position < knightData.position) {
      monsterData.isBack = true;
    } else if (monsterData.position > knightData.position) {
      monsterData.isBack = false;
    }

    if (monster) {
      monster.isBack = monsterData.isBack;
    }
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
        const difference = monsterData.position >= knightData.position ? -knightDefaultData.speed : knightDefaultData.speed;
        monsterData.speed = Monster[monsterData.type].speed + difference;
      } else {
        const difference = monsterData.position <= knightData.position ? -knightDefaultData.speed : knightDefaultData.speed;
        monsterData.speed = Monster[monsterData.type].speed + difference;
      }
    } else {
      monsterData.speed = Monster[monsterData.type].speed;
    }
  }

  function checkMonsterForAliveness() {
    if (monsterData.healthLevel <= 0) {
      removeMonster();
    }
  }

  function removeMonster() {
    if (monster) {
      monster.unrender();
    }

    monster = null;
    monsterData.isAlive = false;

    createMonstersData(1, gameWidth);
    renderMonster(monstersData[monstersData.length - 1]);
  }

  function checkMonsterForDamage() {
    skillDisplaysData.forEach(skillDisplay => {
      if (isMonsterDamaged(skillDisplay) && !skillDisplay.damagedMonsters.includes(monster)) {
        damageMonster(skillDisplay.damage);
        skillDisplay.damagedMonsters.push(monster);
      }
    });
  }

  function damageMonster(damage) {
    monsterData.isDamaged = true;
    monsterData.healthLevel -= damage;
  }

  function isMonsterDamaged(skill) {
    if (skill.isAvailable) {
      return monsterData.position <= skill.position + skill.width && monsterData.position + monsterData.width >= skill.position;
    }
  }
}

function changeMonsterAttackStatus(monsterData) {
  monsterData.isAttack = true;

  const attackTimeout = setTimeout(() => {
    monsterData.isAttack = false;

    if (isKnightDamaged(monsterData)) {
      clearTimeout(attackTimeout);
    }
  }, MONSTERS_ATTACK_SPEED);
}

function createSkillsData() {
  for (key in Weapon) {
    skillsData[key] = Object.assign({}, Weapon[key]);
    skillsData[key].isActive = false;
    skillsData[key].isAvailable = true;
    skillsData[key].damagedMonsters = [];
    skillsData[key].name = key;
  }
}

function setSkillAvailability(skill, isAvailable) {
  skillsData[skill].isAvailable = isAvailable;
}

function renderSkills() {
  skillsWrapper.innerHTML = '';
  const skillsFragment = document.createDocumentFragment();

  weaponTypesArr.forEach(type => {
    const skill = new Skill(skillsData[type]);
    skillsFragment.append(skill.render());

    skill.bind();

    skill.onActivate = (evt) => {
      if (evt.key === skillsData[type].key) {
        if (skillsData[type].key === skillsData["swordsHail"].key) {
          useSwordsHail(knightData.isBack);
        }

        if (skillsData[type].key === skillsData["swordsTrio"].key) {
          useSwordsTrio(knightData.isBack);  
        }

        if (skillsData[type].isAvailable) {
          indicatorsData["mp"].level -= skillsData[type].magicLevelConsumption;
        }

        skill.activate();
        skillsData[type].isAvailable = false;
        skillsData[type].isActive = true;
        
        setTimeout(() => {
          skillsData[type].isAvailable = true;
          skillsData[type].isActive = false;
          skill.recharge();
        }, skillsData[type].rechargeTime);
      }
    }

    skillsWrapper.append(skillsFragment);
  });
}

function useSwordsTrio(isBack) {
  if (skillsData["swordsTrio"].isAvailable) {
    const data = createSkillDisplayData("swordsTrio", isBack);
    const skillDisplay = new SkillDisplay(data);

    gamePage.append(skillDisplay.render(data.position));
  
    requestAnimationFrame(moveSwordsTrio);

    function moveSwordsTrio() {
      if (skillDisplay && settings.isStarted) {
        if (data.position > gameWidth) {
          skillDisplay.unrender()
        }

        if (isBack) {
          data.position -= data.speed;
        } else {
          data.position += data.speed;
        }
        
        skillDisplay.move(data.position);

        requestAnimationFrame(moveSwordsTrio);
      }
    }
  }  
}

function useSwordsHail(isBack) {
  if (skillsData["swordsHail"].isAvailable) {
    const data = createSkillDisplayData("swordsHail", isBack);
    const skillDisplay = new SkillDisplay(data);
  
    gamePage.append(skillDisplay.render(data.position));

    setTimeout(() => {
      skillDisplay.unrender();
      data.isAvailable = false;
    }, SWORDS_HAIL_DURATION);
  }  
}

function createSkillDisplayData(type, isBack) {
  const data = {
    type: type,
    width: skillDisplaysDefaultData[type].width,
    position: setSkillDisplayPosition(skillDisplaysDefaultData[type].width, isBack),
    template: skillDisplaysDefaultData[type].template,
    damage: Weapon[type].damage,
    isBack: isBack,
    isAvailable: true,
    speed: skillDisplaysDefaultData[type].speed,
    damagedMonsters: []
  };

  skillDisplaysData.push(data);

  return skillDisplaysData[skillDisplaysData.length - 1];
}

function setSkillDisplayPosition(width, isBack) {
  let x = knightData.position;
  if (isBack) {
    x -= WEAPON_AND_KNIGHT_GAP * 2;
  } else {
    x += WEAPON_AND_KNIGHT_GAP;
  }

  return x;
}

function createIndicatorsData() {
  indicatorsData = Object.assign({}, indicatorsDefaultData);
}

function renderUserInfo() {
  userInfo.innerHTML = '';

  renderUserName();
  renderIndicators();
}

function renderUserName() {
  const userName = createElement(USER_NAME_TEMPLATE);
  userName.textContent = settings.username;
  userInfo.append(userName);
}

function renderIndicators() {
  indicatorTypesArr.forEach(type => {
    const indicatorData = indicatorsData[type];
    const indicator = new Indicator(indicatorData);
    userInfo.append(indicator.render());

    setInterval(rechargeIndicator, INDICATORS_RECHARGE_TIME);

    requestAnimationFrame(changeIndicatorLevel);

    function changeIndicatorLevel() {
      if (settings.isStarted) {
        indicator.change(indicatorData.level);

        requestAnimationFrame(changeIndicatorLevel);
      }
    }

    function rechargeIndicator() {
      indicatorData.level += indicatorData.rechargePerSecond;

      if (indicatorData.level > 100) {
        indicatorData.level = 100;
      }
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
    this._element = null;
    this._isBack = props.isBack;
    this._position = props.position;
    this._className = props.className; 
    this._runGif = props.runGif;
    this._idleGif = props.idleGif;
    
    this._onRun = null;
    this._onStop = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  _changeDirection() {
    if (typeof this._isBack === 'boolean') {
      if (this._isBack) {
        this._element.style.transform = 'scale(-1, 1)';
      } else {
        this._element.style.transform = 'none';
      }
    }    
  }
  
  _onKeyDown(evt) {
    if (typeof this._onRun === 'function') {
      this._onRun(evt);
    }
  } 

  _onKeyUp(evt) {
    if (typeof this._onStop === 'function') {
      this._onStop(evt);
    }
  }

  set onRun(f) {
    this._onRun = f;
  }

  set onStop(f) {
    this._onStop = f;
  }

  set isBack(value) {
    this._isBack = value;
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
    this._element.style.backgroundImage = `url(${IMG_PATH}${this._runGif})`;
    this._changeDirection();
  }

  stop() {
    this.isMoving = false;
    this._element.style.backgroundImage = `url(${IMG_PATH}${this._idleGif})`;
  }

  bind() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }
}

class Enemy {
  constructor(props) {
    this._element = null;
    this._isAttack = false;
    this._isBack = false;
    this._position = props.position;
    this._width = props.width;
    this._height = props.height;
    this._className = props.className;
  }

  _changeDirection() {
    if (typeof this._isBack === 'boolean') {
      if (this._isBack) {
        this._element.style.transform = 'scale(-1, 1)';
      } else {
        this._element.style.transform = 'none';
      }
    }
  }

  set isBack(value) {
    this._isBack = value;
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
    this._key = props.key;
    this._name = props.name;
    this._iconURL = props.iconURL;
    this._element = null;

    this._onActivate = null;

    this._onActivateKeydown = this._onActivateKeydown.bind(this);
  }

  _onActivateKeydown(evt) {
    if (typeof this._onActivate === `function`) {
      if (evt.key === this._key.toString()) {
        this._onActivate(evt);
      }
    }
  }

  set onActivate(f) {
    this._onActivate = f;
  }

  get template() {
    return `<img src="${IMG_PATH}${this._iconURL}" alt="skill">`;
  }

  render() {
    return this._element = createElement(this.template);
  }

  unrender() {
    this._element.remove();
    this._element = null;
  }

  recharge() {
    this._element.style.filter = 'grayscale(0)';
  }

  activate() {
    this._element.style.filter = 'grayscale(1)';
  }

  bind() {
    document.addEventListener(`keydown`, this._onActivateKeydown);
  }
}

class SkillDisplay {
  constructor(props) {
    this._element = null;
    this._position = props.position;
    this._template = props.template;
    this._isBack = props.isBack;
  }

  get template() {
    return this._template;
  }

  render() {
    this._element = createElement(this.template);
    this._element.style.left = `${this._position}px`;
    this._element.style.transform = this._isBack ? 'scale(-1, 1)' : 'none';
    
    return this._element;
  }

  unrender() {
    if (this._element) {
      this._element.remove();
      this._element = null;
    }    
  }

  move(newPos) {
    if (this._element) {
      this._position = newPos;
      this._element.style.left = `${this._position}px`;
    }    
  }
}

class Indicator {
  constructor(props) {
    this._element = null;
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

  change(value) {
    if (value >= 0) {
      this._level = value;
      this._element.querySelector('.score-value').style.background = `linear-gradient(90deg, ${this._color} ${this._level}%, rgba(0,0,0,1) ${this._level}%)`;
      this._element.querySelector('span').textContent = this._level;
    }    
  }
}