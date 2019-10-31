const KNIGHT_WIDTH = 72;
const BACKGROUND_SIZE = 9558;
const MONSTERS_INTERVAL = 150;
const MIN_MONSTERS_START_POS = 150;
const GAME_WIDTH = document.documentElement.clientWidth;
const MONSTERS_COUNT = 2;
const DENSITY = MONSTERS_INTERVAL * MONSTERS_COUNT;

const startPage = document.querySelector('.screen-start');
const startForm = startPage.querySelector('form');
const nameField = startForm.querySelector('.start-name');
const startButton = startForm.querySelector('.start-submit');
const gamePage = document.querySelector('.screen-game');
const scoreElement = gamePage.querySelector('.kills-value');
const nameInfo = gamePage.querySelector('.user-info');
const pauseModal = gamePage.querySelector('.pause');
const timeElement = gamePage.querySelector('.timer-value');
const rankingPage = document.querySelector('.screen-ranking');

const settings = {
  username: 'user',
  isStarted: false,
  startTime: '',
  pauseTime: '',
  backgroundPosition: BACKGROUND_SIZE,
  speed: 1.5
}

const monstersInfo = [
  {
    className: 'monster-dog',
    width: 64,
    height: 43,
    damage: 2,
    helthLevel: 15
  },
  {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    helthLevel: 30
  },
  {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    helthLevel: 60
  },
];

let knight = ''; // в эту переменную запишется объект рыцаря
let monsters = []; // в эту переменную запишутся все монстры

rankingPage.classList.add('hidden');

nameField.addEventListener('input', onNameFieldInput);
startForm.addEventListener('submit', onStartFormSubmit);

// функции-обработчики событий

function onEscKeyDown(evt) {
  isEscEvent(evt, () => {
    pauseModal.classList.toggle('hidden');
    
    if (settings.isStarted) {
      settings.isStarted = false;
    } else {
      settings.isStarted = true;
      playGame();
    }

    settings.pauseTime = new Date().getTime();
  });
}

function onGameKeyDown(evt) {
  switch (evt.key) {
    case 'ArrowLeft':
      evt.preventDefault();
      knight.directions.forward = false;
      knight.directions.back = true;
      break;
    case 'ArrowRight':
      evt.preventDefault();
      knight.directions.back = false;
      knight.directions.forward = true;
      break;
  }
}

function onGameKeyUp(evt) {
  switch (evt.key) {
    case 'ArrowLeft':
      evt.preventDefault();
      knight.stop();
      break;
    case 'ArrowRight':
      evt.preventDefault();
      knight.stop();
      break;
  }
}

function onNameFieldInput() {
  if (nameField.value !== '') {
		startButton.removeAttribute('disabled');
	} else {
		startButton.setAttribute('disabled', true);
	}
}

function onStartFormSubmit(evt) {
  evt.preventDefault();
  settings.username = nameField.value;
  initGame();
}

// проверка события ESC

function isEscEvent(evt, callback) {
	if (evt.key === 'Escape') {
		callback();
	}
}

// игровые функции

function initGame() {
  if (!settings.isStarted) {
    settings.isStarted = true;

    startPage.classList.add('hidden');
    nameInfo.textContent = settings.username;

    knight = new Knight(gamePage);
    knight.draw();

    drawMonsters(getQuantityOfMonsters(DENSITY));

    if (!settings.startTime) {
			settings.startTime = new Date().getTime();
		} 

		if (settings.pauseTime) {
			settings.startTime += (new Date().getTime() - settings.pauseTime);
			settings.pauseTime = '';
    }

    document.addEventListener('keydown', onGameKeyDown);
    document.addEventListener('keyup', onGameKeyUp);
    document.addEventListener('keydown', onEscKeyDown);

    requestAnimationFrame(playGame);
  }  
}

function playGame() {
  if (settings.isStarted) {
    if (knight.position.left + KNIGHT_WIDTH / MONSTERS_COUNT >= gamePage.clientWidth / 2) {
      knight.speed = settings.speed;
      if (knight.directions.forward) {
        moveBackground('forward');
        knight.speed = 0;
      } else if (knight.directions.back) {
        moveBackground('back');
        knight.speed = 0;
      }

      if (settings.backgroundPosition == 0 || settings.backgroundPosition == BACKGROUND_SIZE) {
        knight.speed = settings.speed;
      }
    }

    if (settings.pauseTime) {
      settings.startTime += (new Date().getTime() - settings.pauseTime);
      settings.pauseTime = '';
    }

    drawCurrentScore();

    knight.go();
    
    moveMonsters();

    requestAnimationFrame(playGame);
  }
}

function drawMonsters(count, startPos) {
  for (let i = 0; i < count; i++) {
    const monsterTypeNumber = Math.floor(Math.random() * monstersInfo.length);
    const monster = new Monster({
      className: monstersInfo[monsterTypeNumber].className,
      width: monstersInfo[monsterTypeNumber].width,
      height: monstersInfo[monsterTypeNumber].height,
      healthLevel: monstersInfo[monsterTypeNumber].healthLevel,
      damage: monstersInfo[monsterTypeNumber].damage,
      density: DENSITY,
      container: gamePage,
      numberOfMonster: i,
      startPos: startPos
    });

    monster.draw();
    monsters.push(monster);
  }
}

function moveMonsters() {
  monsters.forEach((monster) => {
    monster.go();
  });

  if (monsters[monsters.length - 2].x < gamePage.clientWidth / 2) {
    drawMonsters(1, (gamePage.clientWidth - monsters[monsters.length - 2].width * 2));
  }
}

function drawCurrentScore() {
	let timeStr = '';

	const currentTime = Math.floor((new Date().getTime() - settings.startTime) / 1000);
	const currentTimeInMin = Math.floor(currentTime / 60);
	const currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

	settings.score = currentTime;

	timeStr += currentTimeInMin <= 9 ? '0' + currentTimeInMin + ':' : currentTimeInMin + ':';
	timeStr += currentTimeInSec <= 9 ? '0' + currentTimeInSec : currentTimeInSec;

	timeElement.textContent = timeStr;
}

function moveBackground(direction) {
  if (direction === 'forward' && settings.backgroundPosition !== 0) {
    settings.backgroundPosition -= settings.speed;
  } else if (direction === 'back' && settings.backgroundPosition !== 0) {
    settings.backgroundPosition += settings.speed;
  } 

  gamePage.style.backgroundPosition = settings.backgroundPosition + 'px' + ' 0';
}

function getQuantityOfMonsters(height) {
  return GAME_WIDTH / 2 / height - 1;
}

// классы

class Knight {
  constructor(container) {
    this.directions = {
      back: false,
      forward: false
    }
    this.speed = 1.5;
    this._className = 'knight';   
    this._helthLevel = 100;
    this._magicLevel = 100;
    this._x = 10;
    this._width = 72;
    this._container = container;
  }

  draw() {
    const knightImage = document.createElement('div');
		knightImage.classList.add(this._className);
		this._container.appendChild(knightImage);

		this.element = knightImage;
  }

  go() {
    if (this.directions.back) {
      this._x -= this.speed;
      this.element.style.backgroundImage = 'url(assets/img/run.gif)';
      this.element.style.transform = 'scale(-1, 1)';
    }

    if (this.directions.forward) {
      this._x += this.speed;
      this.element.style.backgroundImage = 'url(assets/img/run.gif)';
      this.element.style.transform = 'none';
    }

    if (this._x < 0) {
      this._x = 0;
    } else if (this._x > this._container.clientWidth - this._width) {
      this._x = this._container.clientWidth - this._width;
    }

    this.element.style.left = this._x + 'px';
  }

  stop() {
    this.directions.back = false;
    this.directions.forward = false;

    this.element.style.backgroundImage = 'url(assets/img/idle.gif)';
  }

  get position() {
    return this.element.getBoundingClientRect();
  }
}

class Monster {
  constructor(props) {
    this.damage = props.damage;
    this.width = props.width;
    this._helthLevel = props.healthLevel;    
    this._speed = 0.5;
    this._density = props.density;
    this._number = props.numberOfMonster;
    this._className = props.className
    this._container = props.container;
    this._startPos = props.startPos;
  }

  draw() {
		const monsterElement = document.createElement('div');

    monsterElement.classList.add(this._className);
    this.x = this._startPos ? this._startPos : this._container.clientWidth / 2 + this._density * this._number;
    monsterElement.style.left = this.x + 'px';
    
    this._container.appendChild(monsterElement);
    this.element = monsterElement;
  }
  
  go() {
    this.x -= this._speed;
    this.element.style.left = this.x + 'px';

    if (this.x < 0 - this._width) {
      this._container.removeChild(this.element);
    }
  }
}