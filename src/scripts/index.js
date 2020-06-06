const { createPuzzle } = require('./generator')

var state = null

class IdleStateController {
  constructor () {
    this.model = new IdleStateModel()
    this.view = new IdleStateView()
  }

  setUp () {
    this.view.setUp(this.model)
    this.view.gameBoardView.onclick = event => {
      onGameBoardClicked(event, this.model.puzzle.size, (i) => this.onTileClicked(i))
    }
  }

  onTileClicked (index) {
    if (this.model.canChangeTile(index)) {
      this.model.switchTile(index)
      this.view.updateTile(this.model, index)
    }
  }
}

class IdleStateModel {
  constructor () {
    this.puzzle = createPuzzle(8)
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
}

class IdleStateView {
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

document.addEventListener('DOMContentLoaded', function () {
  state = new IdleStateController()
  state.setUp()
})
