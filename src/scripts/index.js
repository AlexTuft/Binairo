const { createPuzzle } = require('./generator')

var gameData = {}
var state = null

class IdleStateController {
  constructor (puzzle) {
    this.gameBoardModel = new GameBoardModel(puzzle)
    this.view = new IdleStateView()
  }

  setUp () {
    this.view.setUp(this.gameBoardModel)
    this.view.gameBoardView.gameBoardView.onclick = event => {
      onGameBoardClicked(event, this.gameBoardModel.puzzle.size, (i) => this.onTileClicked(i))
    }
  }

  tearDown () {
    this.view.tearDown()
    this.view.gameBoardView.gameBoardView.onclick = null
  }

  onTileClicked (index) {
    if (this.gameBoardModel.canChangeTile(index)) {
      const playingState = new PlayingStateController(this.gameBoardModel, this.view.gameBoardView)
      transitionToState(playingState)
      playingState.onTileClicked(index)
    }
  }
}

class IdleStateView {
  constructor (gameBoardView) {
    this.gameBoardView = new GameBoardView()
    this.timeView = document.getElementById('time')
    this.messageView = document.getElementById('message')
  }

  setUp (gameBoardModel) {
    this.gameBoardView.setUp(gameBoardModel)
    this.timeView.innerText = '0:00'
    this.messageView.innerText = 'Click on tile to start'
    this.messageView.classList.add('show')
  }

  tearDown () {
    this.messageView.classList.remove('show')
    setTimeout(() => { this.messageView.innerText = '' }, 500)
  }
}

class PlayingStateController {
  constructor (gameBoardModel, gameBoardView) {
    this.model = new PlayingStateModel(gameBoardModel)
    this.view = new PlayingStateView(gameBoardView)
  }

  setUp () {
    this.view.setUp()
    this.view.gameBoardView.gameBoardView.onclick = event => {
      onGameBoardClicked(event, this.model.gameBoardModel.puzzle.size, (i) => this.onTileClicked(i))
    }
    this.view.resetButton.onclick = () => {
      transitionToState(new IdleStateController(this.model.gameBoardModel.puzzle))
    }
    this.timeId = setInterval(() => {
      this.model.time += 200
      this.view.refreshTimer(this.model)
    }, 200)
  }

  tearDown () {
    this.view.tearDown()
    this.view.gameBoardView.gameBoardView.onclick = null
    this.view.resetButton.onclick = null

    clearInterval(this.timeId)
  }

  onTileClicked (index) {
    if (this.model.gameBoardModel.canChangeTile(index)) {
      this.model.gameBoardModel.switchTile(index)
      this.view.gameBoardView.updateTile(this.model.gameBoardModel, index)

      if (this.model.gameBoardModel.isSolved()) {
        transitionToState(new FinishedStateController(this.model.time))
      }
    }
  }
}

class PlayingStateModel {
  constructor (gameBoardModel) {
    this.gameBoardModel = gameBoardModel
    this.time = 0
  }
}

class PlayingStateView {
  constructor (gameBoardView) {
    this.gameBoardView = gameBoardView
    this.timeView = document.getElementById('time')
    this.resetButton = document.getElementById('resetButton')
  }

  setUp () {
    this.resetButton.classList.remove('disabled')
  }

  tearDown () {
    this.resetButton.classList.add('disabled')
  }

  refreshTimer (model) {
    this.timeView.innerText = formatTime(model.time)
  }
}

class FinishedStateController {
  constructor (time) {
    if (gameData.bestTime === undefined || gameData.bestTime > time) {
      gameData.bestTime = time
      window.localStorage.bestTime = gameData.bestTime
    }
    this.view = new FinishedStateView()
  }

  setUp () {
    this.view.setUp()
    this.view.updateBestTime(gameData.bestTime)
  }

  tearDown () {
    this.view.tearDown()
  }
}

class FinishedStateView {
  constructor () {
    this.messageView = document.getElementById('message')
    this.bestTimeView = document.getElementById('bestTime')
    this.controlsView = document.getElementById('controls')
  }

  setUp () {
    this.messageView.innerText = 'Well done!'
    this.messageView.classList.add('show')
  }

  tearDown () {
    this.messageView.classList.remove('show')
    this.messageView.innerText = ''
  }

  updateBestTime (bestTime) {
    this.bestTimeView.innerText = formatTime(bestTime)
  }
}

class GameBoardModel {
  constructor (puzzle) {
    if (puzzle !== undefined) {
      this.puzzle = puzzle
    } else {
      this.puzzle = createPuzzle(8)
    }
    this.board = this.puzzle.initialState.slice()
  }

  canChangeTile (index) {
    return this.puzzle.initialState[index] === null
  }

  switchTile (index) {
    if (this.board[index] === null) {
      this.board[index] = 0
    } else if (this.board[index] === 0) {
      this.board[index] = 1
    } else if (this.board[index] === 1) {
      this.board[index] = null
    }
  }

  isSolved () {
    return this.board.isEqualTo(this.puzzle.solution)
  }
}

class GameBoardView {
  constructor () {
    this.gameBoardView = document.getElementById('gameBoard')
    this.gameTileViews = this.gameBoardView.getElementsByClassName('tile-click-area')
  }

  setUp (model) {
    this.drawBoardToView(model)
  }

  drawBoardToView (model) {
    for (let i = 0; i < model.puzzle.size * model.puzzle.size; i++) {
      this.updateTile(model, i)
    }
  }

  updateTile (model, tileIndex) {
    const tileView = this.gameTileViews[tileIndex]
    const tile = model.board[tileIndex]

    tileView.classList = ['tile-click-area'] // reset to default state

    if (!model.canChangeTile(tileIndex)) {
      tileView.classList.add('initial')
    }

    if (tile === 0) {
      tileView.classList.add('z')
    } else if (tile === 1) {
      tileView.classList.add('o')
    }
  }
}

function onGameBoardClicked (event, boardSize, onTileClicked) {
  const tileWidth = Math.floor(event.currentTarget.clientWidth / boardSize)
  const tileHeight = Math.floor(event.currentTarget.clientHeight / boardSize)

  const clickX = event.clientX - event.currentTarget.offsetLeft
  const clickY = event.clientY - event.currentTarget.offsetTop

  const tilePosX = Math.floor(clickX / tileWidth)
  const tilePosY = Math.floor(clickY / tileHeight)

  const tileIndex = tilePosX + (tilePosY * boardSize)
  onTileClicked(tileIndex)
}

function formatTime (timeMillis) {
  const minutes = Math.floor(timeMillis / 1000 / 60)
  let seconds = Math.floor(timeMillis / 1000 - (minutes * 60))

  let timeString = ''

  if (seconds < 10) {
    seconds = '0' + seconds
  }

  if (minutes > 0) {
    timeString = minutes + ':' + seconds
  } else {
    timeString = '0:' + seconds
  }

  return timeString
}

function transitionToState (nextState) {
  if (state !== null && typeof state.tearDown === 'function') {
    state.tearDown()
  }
  state = nextState
  state.setUp()
}

document.addEventListener('DOMContentLoaded', function () {
  const newGameButton = document.getElementById('newGameButton')
  newGameButton.onclick = () => transitionToState(new IdleStateController())

  if (window.localStorage.bestTime !== undefined) {
    gameData.bestTime = Number(window.localStorage.bestTime)
    const bestTimeView = document.getElementById('bestTime')
    bestTimeView.innerText = formatTime(gameData.bestTime)
  }

  transitionToState(new IdleStateController())
})
