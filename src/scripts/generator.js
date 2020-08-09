Array.prototype.count = function (value) {
  let valueCount = 0
  for (let i = 0; i < this.length; i++) {
    if (value === this[i]) {
      valueCount++
    }
  }
  return valueCount
}

Array.prototype.isEqualTo = function (other) {
  if (other === null || !Array.isArray(other)) {
    return false
  }
  if (this.length !== other.length) {
    return false
  }
  for (let i = 0; i < this.length; i++) {
    if (this[i] !== other[i] || (this[i] === null && other[i] === null)) {
      return false
    }
  }
  return true
}

function swapColors () {
  for (let i = 0; i < this.solution.length; i++) {
    if (this.solution[i] === 0) {
      this.solution[i] = 1
    } else if (this.solution[i] === 1) {
      this.solution[i] = 0
    }

    if (this.initialState[i] === 0) {
      this.initialState[i] = 1
    } else if (this.initialState[i] === 1) {
      this.initialState[i] = 0
    }
  }
}

function createPuzzle (size) {
  const solution = generateValidPuzzle(size)
  const initialState = findValidInitialState(solution, size)
  return { size, solution, initialState, swapColors }
}

function generateValidPuzzle (size) {
  const puzzle = new Array(size * size).fill(null)
  fillPuzzle(puzzle, size)
  return puzzle
}

function fillPuzzle (puzzle, size, i = 0) {
  let possibleValues = getPossibleValues(puzzle, size, i)
  if (possibleValues.length === 0) {
    return false
  }

  possibleValues = shuffle(possibleValues)
  if (i === puzzle.length - 1) {
    puzzle[i] = possibleValues[0] // if it is the last element in the puzzle, just pick the first and return, it will be a complete solution
    return true
  }

  for (const value of possibleValues) {
    puzzle[i] = value

    const solutionFound = fillPuzzle(puzzle, size, i + 1)
    if (solutionFound) {
      return true
    }
  }

  // No valid puzzle from this point in the reccursion
  puzzle[i] = null
  return false
}

function getPossibleValues (puzzle, size, i) {
  const values = []
  if (canPlace(puzzle, size, i, 0)) {
    values.push(0)
  }
  if (canPlace(puzzle, size, i, 1)) {
    values.push(1)
  }
  return values
}

function canPlace (puzzle, size, tileIndex, value) {
  puzzle[tileIndex] = value // modify now to see if it would cause invalid state

  const canPlace = isChangeValid(getRows(puzzle, size), Math.floor(tileIndex / size), value)
    && isChangeValid(getColumns(puzzle, size), tileIndex % size, value)

  puzzle[tileIndex] = null

  return canPlace
}

function isChangeValid (rowsOrCols, changedRowOrColIndex, newValue) {
  const line = rowsOrCols[changedRowOrColIndex]

  return newValueDoesNotOccurrTooManyTimes(line, newValue)
    && allLinesAreUnique(rowsOrCols, changedRowOrColIndex)
    && newValueDoesNotOccurrToManyTimesConsecutively(line, newValue)
}

function newValueDoesNotOccurrTooManyTimes (line, newValue) {
  const maxAmountOfEachValue = line.length / 2
  const newValueCount = line.count(newValue)
  return newValueCount <= maxAmountOfEachValue
}

function allLinesAreUnique (lines, changedLineIndex) {
  for (let i = 0; i < lines.length; i++) {
    if (i !== changedLineIndex && lines[changedLineIndex].isEqualTo(lines[i])) {
      return false
    }
  }
  return true
}

function newValueDoesNotOccurrToManyTimesConsecutively (line, newValue) {
  let consecutiveValueCount = 0
  for (let i = 0; i < line.length; i++) {
    if (line[i] === newValue) {
      consecutiveValueCount++
    } else {
      consecutiveValueCount = 0
    }
    if (consecutiveValueCount === 3) {
      return false
    }
  }

  return true
}

function getRows (puzzle, size) {
  const rows = []
  for (let i = 0; i < size; i++) {
    rows.push(getRow(puzzle, size, i))
  }
  return rows
}

function getRow (puzzle, size, rowIndex) {
  const start = size * rowIndex
  const end = start + size
  return puzzle.slice(start, end)
}

function getColumns (puzzle, size) {
  const columns = []
  for (let i = 0; i < size; i++) {
    columns.push(getColumn(puzzle, size, i))
  }
  return columns
}

function getColumn (puzzle, size, columnIndex) {
  const column = []
  for (let i = 0; i < size; i++) {
    column.push(puzzle[size * i + columnIndex])
  }
  return column
}

function shuffle (values) {
  if (values.length === 1 || Math.random() < 0.5) {
    return values
  }
  return [values[1], values[0]] // assumes there are only 2 elements
}

function findValidInitialState (solution, size) {
  solution = solution.slice()

  const visibleTiles = new Array(solution.length)
  for (let i = 0; i < visibleTiles.length; i++) {
    visibleTiles[i] = i
  }

  while (visibleTiles.length > 0) {
    const ttrIndex = Math.floor(Math.random() * visibleTiles.length)
    const tileToRemove = visibleTiles[ttrIndex]

    const removedValue = solution[tileToRemove]

    solution[tileToRemove] = null
    const possibleSolutions = countPossibleSolutions(solution, size)

    if (possibleSolutions > 1 || !canSolvePuzzle(solution, size)) {
      solution[tileToRemove] = removedValue
    }

    visibleTiles[ttrIndex] = visibleTiles[visibleTiles.length - 1]
    visibleTiles.pop()
  }

  return solution
}

function countPossibleSolutions (puzzle, size) {
  let count = 0

  let nextEmptyTile = 0
  while (nextEmptyTile < puzzle.length) {
    if (puzzle[nextEmptyTile] === null) {
      break
    }
    nextEmptyTile++
  }

  if (nextEmptyTile === puzzle.length) {
    count++
  } else {
    const possibleValues = getPossibleValues(puzzle, size, nextEmptyTile)
    if (possibleValues.length > 0) {
      for (const value of possibleValues) {
        puzzle[nextEmptyTile] = value
        count += countPossibleSolutions(puzzle, size)
      }
    }
    puzzle[nextEmptyTile] = null
  }

  return count
}

function canSolvePuzzle (puzzle, size) {
  puzzle = puzzle.slice()

  let solved = false
  while (!solved) {
    solved = true // we will disprove this if we find an empty tile
    let foundNextMove = false

    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i] !== null) {
        continue
      }
      solved = false

      // assume that each tile will have at least one possible value at this point
      const possibleValues = getPossibleValues(puzzle, size, i)
      if (possibleValues.length === 1) {
        puzzle[i] = possibleValues[0]
        foundNextMove = true
        break
      }
    }

    if (!solved && !foundNextMove) {
      return false
    }
  }

  return true
}

module.exports = { createPuzzle }
