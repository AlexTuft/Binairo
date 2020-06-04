Array.prototype.count = function (value) {
  var valueCount = 0
  for (var i = 0; i < this.length; i++) {
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
  for (var i = 0; i < this.length; i++) {
    if (this[i] !== other[i] || (this[i] === null && other[i] === null)) {
      return false
    }
  }
  return true
}

function createPuzzle (size) {
  solution = generateValidPuzzle(size)
  initialState = findValidInitialState(solution, size)
  return { size, solution, initialState }
}
``
function generateValidPuzzle (size) {
  let puzzle = new Array(size * size).fill(null)
  fillPuzzle(puzzle, size)
  return puzzle
}

function fillPuzzle (puzzle, size, i=0) {
  possibleValues = getPossibleValues(puzzle, size, i)
  if (possibleValues.length === 0) {
    return false
  }

  possibleValues = shuffle(possibleValues)
  if (i === puzzle.length - 1) {
    puzzle[i] = possibleValues[0] // if it is the last element in the puzzle, just pick the first and return, it will be a complete solution
    return true
  }

  for (let value of possibleValues) {
    puzzle[i] = value
  
    solutionFound = fillPuzzle(puzzle, size, i + 1)
    if (solutionFound) {
      return true
    }
  }

  // No valid puzzle from this point in the reccursion
  puzzle[i] = null
  return false
}

function getPossibleValues (puzzle, size, i) {
  values = []
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

  let canPlace = isChangeValid(getRows(puzzle, size), Math.floor(tileIndex / size), value)
    && isChangeValid(getColumns(puzzle, size), tileIndex % size, value)

  puzzle[tileIndex] = null
  
  return canPlace
}

function isChangeValid (rowsOrCols, changedRowOrColIndex, newValue) {
  let line = rowsOrCols[changedRowOrColIndex]

  return newValueDoesNotOccurrTooManyTimes(line, newValue)
    && allLinesAreUnique(rowsOrCols, changedRowOrColIndex)
    && newValueDoesNotOccurrToManyTimesConsecutively(line, newValue)
}

function newValueDoesNotOccurrTooManyTimes(line, newValue) {
  const maxAmountOfEachValue = line.length / 2
  let newValueCount = line.count(newValue)
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

function newValueDoesNotOccurrToManyTimesConsecutively(line, newValue) {
  var consecutiveValueCount = 0
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
  rows = []
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
  columns = []
  for (let i = 0; i < size; i++) {
    columns.push(getColumn(puzzle, size, i))
  }
  return columns
}

function getColumn (puzzle, size, columnIndex) {
  column = []
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

  let visibleTiles = new Array(solution.length)
  for (let i = 0; i < visibleTiles.length; i++) {
    visibleTiles[i] = i
  }

  while (visibleTiles.length > 0) {
    let ttrIndex = Math.floor(Math.random() * visibleTiles.length)
    let tileToRemove = visibleTiles[ttrIndex]
    
    let removedValue = solution[tileToRemove]
    
    solution[tileToRemove] = null
    possibleSolutions = countPossibleSolutions(solution, size)

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
    possibleValues = getPossibleValues(puzzle, size, nextEmptyTile)
    if (possibleValues.length > 0) {
      for (let value of possibleValues) {
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
      possibleValues = getPossibleValues(puzzle, size, i)
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

module.exports = { generateValidpuzzle: generateValidPuzzle }


size = 8
puzzle = createPuzzle(size)

is = ''
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    var e = puzzle.initialState[j + i * size]
    if (e === null) {
      is += ' ,'
    } else {
      is += e + ','
    }
  }
  is += '\n'
}
console.log(is)

console.log('----------------------------------------------')

s = ''
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
      s += puzzle.solution[j + i * size] + ' '
  }
  s += '\n'
}

console.log(s)