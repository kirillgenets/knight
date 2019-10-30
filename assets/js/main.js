const KNIGHT_WIDTH = 72;
const BACKGROUND_SIZE = 9558;

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
  speed: 1.5,
}

let knight = ''; // в эту переменную запишется объект рыцаря

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
    if (knight.position.left + KNIGHT_WIDTH / 2 >= document.documentElement.clientWidth / 2) {
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

    requestAnimationFrame(playGame);
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

// классы

class Knight {
  constructor(container) {
    this._className = 'knight';
    this.directions = {
      back: false,
      forward: false
    }
    this._helthLevel = 100;
    this._magicLevel = 100;
    this._x = 10;
    this._speed = 1.5;
    this._width = 72;
    this._container = container;
  }

  draw() {
    const knightImage = document.createElement('div');
		knightImage.classList.add(this._className);
		this._container.appendChild(knightImage);

		this._element = knightImage;
  }

  go() {
    if (this.directions.back) {
      this._x -= this._speed;
      this._element.style.backgroundImage = 'url(assets/img/run.gif)';
      this._element.style.transform = 'scale(-1, 1)';
    }

    if (this.directions.forward) {
      this._x += this._speed;
      this._element.style.backgroundImage = 'url(assets/img/run.gif)';
      this._element.style.transform = 'none';
    }

    if (this._x < 0) {
      this._x = 0;
    } else if (this._x > this._container.clientWidth - this._width) {
      this._x = this._container.clientWidth - this._width;
    }

    this._element.style.left = this._x + 'px';
  }

  stop() {
    this.directions.back = false;
    this.directions.forward = false;

    this._element.style.backgroundImage = 'url(assets/img/idle.gif)';
  }

  get position() {
    return this._element.getBoundingClientRect();
  }

  set speed(speed) {
    if (speed >= 0) {
      this._speed = speed;
    }    
  }
}