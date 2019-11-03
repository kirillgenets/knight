const KNIGHT_WIDTH = 72;
const BACKGROUND_SIZE = 9558;
const MONSTERS_INTERVAL = 150;
const MIN_MONSTERS_START_POS = 150;
const GAME_WIDTH = document.documentElement.clientWidth;
const MONSTERS_COUNT = 2;
const DENSITY = MONSTERS_INTERVAL * MONSTERS_COUNT;
const MONSTER_AND_KNIGHT_GAP = 10;
const SHOWN_RESULTS_COUNT = 10;

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
const rankingTable = rankingPage.querySelector('.ranking-table');

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

const monstersInfo = [
  {
    className: 'monster-dog',
    width: 64,
    height: 43,
    damage: 2,
    healthLevel: 15,
    speed: 0.7
  },
  {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    healthLevel: 30,
    speed: 0.5
  },
  {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    healthLevel: 60,
    speed: 0.2
  },
];

let usersResults = JSON.stringify([
  {
		name: 'Влад',
    score: 18,
    time: '12:43'
	},
	{
		name: 'Иван',
    score: 5,
    time: '12:43'
	},
	{
		name: 'Дима',
    score: 73,
    time: '12:43'
	},
	{
		name: 'Игорь',
    score: 2,
    time: '12:43'
	},
	{
		name: 'Кирилл',
    score: 19,
    time: '12:43'
	},
	{
		name: 'Лёша',
    score: 5,
    time: '12:43'
	},
	{
		name: 'Вася',
    score: 7,
    time: '12:43'
	},
	{
		name: 'Лёня',
    score: 29,
    time: '12:43'
	},
	{
		name: 'Руслан',
    score: 11,
    time: '12:43'
	},
	{
		name: 'Аслан',
    score: 13,
    time: '12:43'
	},
	{
		name: 'Виктор',
    score: 24,
    time: '12:43'
	},
	{
		name: 'Катя',
    score: 16,
    time: '12:43'
	},
]);

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
        
        monsters.forEach((monster) => {
          if (monster.x <= gamePage.clientWidth / 2) {
            monster.changeSpeed(knight.speed);
          } else {
            monster.changeSpeed(- knight.speed);
          }
        });

        knight.speed = 0;        
      } else if (knight.directions.back) {
        moveBackground('back');
        
        monsters.forEach((monster) => {
          if (monster.x >= gamePage.clientWidth / 2) {
            monster.changeSpeed(knight.speed);
          } else {
            monster.changeSpeed(- knight.speed);
          }
        });

        knight.speed = 0;
      } else {
        monsters.forEach((monster) => {
          monster.changeSpeed(0);
        });
      }

      if (settings.backgroundPosition == 0 || settings.backgroundPosition == BACKGROUND_SIZE) {
        knight.speed = settings.speed;
        
        monsters.forEach((monster) => {
          monster.changeSpeed(0);
        });
      }
    }

    if (settings.pauseTime) {
      settings.startTime += (new Date().getTime() - settings.pauseTime);
      settings.pauseTime = '';
    }

    if (knight.healthLevel <= 0) {
      overGame();
    }

    drawCurrentScore();

    knight.go();
    
    moveMonsters();

    requestAnimationFrame(playGame);
  }
}

function overGame() {
  settings.isStarted = false;
	settings.startTime = '';
	settings.pauseTime = '';

	saveResult();
	showResults();

	document.removeEventListener('keydown', onGameKeyDown);
	document.removeEventListener('keydown', onEscKeyDown);
	document.removeEventListener('keyup', onGameKeyUp);
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
      startPos: startPos,
      speed: monstersInfo[monsterTypeNumber].speed
    });

    monster.draw();
    monsters.push(monster);
  }
}

function moveMonsters() {
  monsters.forEach((monster) => {
    if (monster.x < knight.position.left) {
      monster.directions.back = true;
      monster.directions.forward = false;
      monster.go();
    } else if (monster.x === knight.position.left && monster.x === knight.position.right) {
      monster.directions.back = false;
      monster.directions.forward = false;
    } else if (monster.x > knight.position.right) {
      monster.directions.back = false;
      monster.directions.forward = true;
      monster.go();
    }

    monster.isConflict(knight.position, knight.decreaseHealthLevel);
  });

  if (monsters[monsters.length - 2].x <= gamePage.clientWidth / 2 && monsters.length < 10) {
    drawMonsters(1, (gamePage.clientWidth - monsters[monsters.length - 2].width * 2));
  }
}

function drawCurrentScore() {
	let timeStr = '';

	const currentTime = Math.floor((new Date().getTime() - settings.startTime) / 1000);
	const currentTimeInMin = Math.floor(currentTime / 60);
	const currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

	timeStr += currentTimeInMin <= 9 ? `0${currentTimeInMin}:` : `${currentTimeInMin}:`;
	timeStr += currentTimeInSec <= 9 ? `0${currentTimeInSec}` : currentTimeInSec;

  timeElement.textContent = timeStr;
  settings.time = timeStr;
}

function moveBackground(direction) {
  if (direction === 'forward' && settings.backgroundPosition !== 0) {
    settings.backgroundPosition -= settings.speed;
  } else if (direction === 'back' && settings.backgroundPosition !== 0) {
    settings.backgroundPosition += settings.speed;
  } 

  gamePage.style.backgroundPosition = `${settings.backgroundPosition}px 0`;
}

function getQuantityOfMonsters(height) {
  return GAME_WIDTH / 2 / height - 1;
}

function saveResult() {
	settings.result = {
		name: settings.username,
    score: settings.score,
    time: settings.time
	};

	usersResults = JSON.parse(usersResults);

	const lastUserResult = usersResults.filter(function (result) {
		return result.name === settings.name
	});

	if (lastUserResult.length > 0) {
		usersResults.splice(usersResults.indexOf(lastUserResult[0]), 1);
	} 

	usersResults.push(settings.result);
}

function showResults() {
	resetRankingTable();

	const sortedResults = usersResults.sort(function (a, b) {
		return b.score - a.score
	});

	sortedResults.splice(SHOWN_RESULTS_COUNT, sortedResults.length - SHOWN_RESULTS_COUNT);
	const isUserResultInTop = sortedResults.includes(settings.result);

	if (!isUserResultInTop) {
		sortedResults[sortedResults.length - 1] = settings.result;
	} 
	sortedResults.forEach(function (result, index) {
		const row = document.createElement('tr');

		const hashColumn = document.createElement('td');
    hashColumn.textContent = index + 1;
    row.appendChild(hashColumn);

    const nameColumn = document.createElement('td');
    nameColumn.textContent = result.name;
    row.appendChild(nameColumn);

    const scoreColumn = document.createElement('td');
    scoreColumn.textContent = result.score;
    row.appendChild(scoreColumn);
    
    const timeColumn = document.createElement('td');
    timeColumn.textContent = result.time;
    row.appendChild(timeColumn);

		rankingTable.appendChild(row);
	});

	rankingPage.classList.remove('hidden');		

	usersResults = JSON.stringify(usersResults);
}

function resetRankingTable() {
	rankingTable.innerHTML = '';

  const row = document.createElement('tr');
  
  const hashColumn = document.createElement('th');
	hashColumn.textContent = '#';
	row.appendChild(hashColumn);

	const nameColumn = document.createElement('th');
	nameColumn.textContent = 'Username';
	row.appendChild(nameColumn);

	const scoreColumn = document.createElement('th');
	scoreColumn.textContent = 'Killed monsters';
  row.appendChild(scoreColumn);
  
  const timeColumn = document.createElement('th');
	timeColumn.textContent = 'Time';
	row.appendChild(timeColumn);

	rankingTable.appendChild(row);
}

// классы

class Knight {
  constructor(container) {
    this.directions = {
      back: false,
      forward: false
    };
    this.speed = 1.5;
    this._className = 'knight';   
    this.healthLevel = 100;
    this._magicLevel = 100;
    this.x = 10;
    this._width = 72;
    this._container = container;
    this.decreaseHealthLevel = this.decreaseHealthLevel.bind(this);
  }

  draw() {
    const knightImage = document.createElement('div');
		knightImage.classList.add(this._className);
		this._container.appendChild(knightImage);

		this.element = knightImage;
  }

  go() {
    if (this.directions.back) {
      this.x -= this.speed;
      this.element.style.backgroundImage = 'url(assets/img/run.gif)';
      this.element.style.transform = 'scale(-1, 1)';
    }

    if (this.directions.forward) {
      this.x += this.speed;
      this.element.style.backgroundImage = 'url(assets/img/run.gif)';
      this.element.style.transform = 'none';
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this._x > this._container.clientWidth - this._width) {
      this.x = this._container.clientWidth - this._width;
    }

    if (!this.healthLevel) {
      console.log('dead');
    }

    this.element.style.left = `${this.x}px`;
  }

  stop() {
    this.directions.back = false;
    this.directions.forward = false;

    this.element.style.backgroundImage = 'url(assets/img/idle.gif)';
  }

  decreaseHealthLevel(damage) {
    this.healthLevel -= damage;

    const scoreContainer = this._container.querySelector('.score-value');

    scoreContainer.style.background = `linear-gradient(90deg, rgba(159,0,10,1) ${this.healthLevel}%, rgba(255,255,255,1) ${this.healthLevel}%)`;
    scoreContainer.querySelector('span').textContent = this.healthLevel;
  }

  fight() {

  }

  get position() {
    return this.element.getBoundingClientRect();
  }
}

class Weapon {
  constructor(props) {
    this.damage = props.damage;
    this._rechargeTime = props.rechargeTime;
    this._magicLevelConsumption = props.magicLevelConsumption;
  }
}

class Monster {
  constructor(props) {
    this.damage = props.damage;
    this.width = props.width;
    this.directions = {
      back: false,
      forward: true
    };
    this.speed = props.speed;
    this._damageInterval;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;    
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
    monsterElement.style.left = `${this.x}px`;
    
    this._container.appendChild(monsterElement);
    this.element = monsterElement;
  }
  
  go() {
    if (this.directions.forward) {
      this.x -= this.speed;
      this.element.style.left = `${this.x}px`;
      this.changeDirection();
    }    

    if (this.directions.back) {
      this.x += this.speed;
      this.element.style.left = `${this.x}px`;
      this.changeDirection();
    }

    if (this.x < 0 - this._width) {
      this._container.removeChild(this.element);
    }
  }

  changeSpeed(coefficent) {
    this.speed = this._speed - coefficent;
  }

  changeDirection() {
    this.element.style.transform = this.directions.forward ? 'none' : 'scale(-1, 1)';
  }

  isConflict(knightCoords, callback) {
    const monsterCoords = this.element.getBoundingClientRect();

    if (knightCoords.left <= monsterCoords.right && knightCoords.right >= monsterCoords.left) {
      this._damageInterval = setInterval(callback, 1000, this.damage);
    } else {
      clearInterval(this._damageInterval);
    }
  }
}