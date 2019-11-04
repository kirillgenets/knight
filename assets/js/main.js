const KNIGHT_WIDTH = 72;
const BACKGROUND_SIZE = 9558;
const MONSTERS_INTERVAL = 150;
const MIN_MONSTERS_START_POS = 150;
const GAME_WIDTH = document.documentElement.clientWidth;
const MONSTERS_COUNT = GAME_WIDTH >= 1024 ? 2 : 1;
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
const healthContainer = gamePage.querySelector('.panel-xp .score-value');
const healthContainerValue = healthContainer.querySelector('span');
const timeElement = gamePage.querySelector('.timer-value');
const rankingPage = document.querySelector('.screen-ranking');
const rankingTable = rankingPage.querySelector('.ranking-table');
const playAgainButton = rankingPage.querySelector('.play-again');

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
    speed: 0.7
  },
  elf: {
    className: 'monster-elf',
    width: 59,
    height: 72,
    damage: 5,
    healthLevel: 30,
    speed: 0.5
  },
  grinch: {
    className: 'monster-grinch',
    width: 68,
    height: 88,
    damage: 10,
    healthLevel: 60,
    speed: 0.2
  },
};

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
playAgainButton.addEventListener('click', onPlayAgainButtonClick);

// функции-обработчики событий

function onPlayAgainButtonClick() {
  rankingPage.classList.add('hidden');
  
  resetGame();
	initGame();
}

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
  const monsterTypesArr = generateMonsterTypesArray();
  for (let i = 0; i < count; i++) {
    const monsterType = monsterTypesArr[Math.floor(Math.random() * monsterTypesArr.length)];
    const monster = new Enemy(Monster[monsterType]);

    console.log(count);

    monster.draw(i, gamePage, DENSITY, startPos);
    monsters.push(monster);
  }
}

function generateMonsterTypesArray() {
  const result = [];

  for (key in Monster) {
    result.push(key);
  }
  
  return result;
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

    // monster.isConflict(knight.position, knight.decreaseHealthLevel);
  });

  if (monsters[monsters.length - MONSTERS_COUNT].x <= gamePage.clientWidth / 2 && monsters.length < 10) {
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

function resetGame() {
  settings.score = 0;
  settings.time = '';
	timeElement.textContent = '00:00';

	clearMonsters();

	for (let dir in knight.directions) {
		knight.directions[dir] = false;
	}

  knight.healthLevel = 100;
  gamePage.removeChild(knight.element);

  healthContainer.style.background = '#9f000a';
  healthContainerValue.textContent = 100;
}

function clearMonsters() {
  document.querySelectorAll('.monster').forEach((monster) => {gamePage.removeChild(monster)});
  monsters.forEach((monster) => {clearInterval(monster.damageInterval)});
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
  rankingTable.insertAdjacentHTML

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
    this.healthLevel = 100;
    this.x = 10;
    // this.decreaseHealthLevel = this.decreaseHealthLevel.bind(this);
    this._className = 'knight'; 
    this._magicLevel = 100;
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

  // decreaseHealthLevel(damage, interval) {
  //   if (this.healthLevel) {
  //     this.healthLevel -= damage;

  //     console.log('Ауч')

  //     const healthContainer = this._container.querySelector('.panel-xp .score-value');

  //     healthContainer.style.background = `linear-gradient(90deg, rgba(159,0,10,1) ${this.healthLevel}%, rgba(255,255,255,1) ${this.healthLevel}%)`;
  //     healthContainer.querySelector('span').textContent = this.healthLevel;
  //   } else {
  //     clearInterval(interval);
  //   }
  // }

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

class Enemy {
  constructor(props) {
    this.damage = props.damage;
    this.width = props.width;
    this.directions = {
      back: false,
      forward: true
    };
    this.speed = props.speed;
    this.damageInterval;
    this._speed = props.speed;
    this._healthLevel = props.healthLevel;    
    this._className = props.className;
  }

  draw(number, container, density, startPos) {
		const monsterElement = document.createElement('div');

    monsterElement.classList.add(this._className);
    monsterElement.classList.add('monster');
    this.x = startPos ? startPos : container.clientWidth / 2 + density * number;
    monsterElement.style.left = `${this.x}px`;
    
    container.appendChild(monsterElement);
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

  // isConflict(knightCoords, callback) {
  //   const monsterCoords = this.element.getBoundingClientRect();

  //   if (knightCoords.left <= monsterCoords.right && knightCoords.right >= monsterCoords.left) {
  //     if (this.damageInterval) {
  //       clearInterval(this.damageInterval);
  //     }

  //     this.damageInterval = setInterval(callback, 1000, this.damage, this.damageInterval);
  //   } else {
  //     clearInterval(this.damageInterval);
  //   }
  // }
}