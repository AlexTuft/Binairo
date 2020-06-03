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
  solution = generateValidGrid(size)
  initialState = findValidInitialState(solution, size)
  return { size, solution, initialState }
}

function generateValidGrid (size) {
  grid = new Array(size * size).fill(null)
  fillGrid(grid, size)
  return grid
}

function fillGrid (grid, gridSize, i=0) {
  possibleValues = getPossibleValues(grid, gridSize, i)
  if (possibleValues.length === 0) {
    grid[i] = null
    return false
  }

  possibleValues = shuffle(possibleValues)
  if (i === grid.length - 1) {
    grid[i] = possibleValues[0] // if it is the last element in the grid, just pick the first and return, it will be a complete solution
    return true
  }

  for (let value of possibleValues) {
    grid[i] = value
  
    solutionFound = fillGrid(grid, gridSize, i + 1)
    if (solutionFound) {
      return true
    }
  }

  grid[i] = null
  return false // we couldn't find a valid solution from this point
}

function getPossibleValues (puzzle, size, i) {
  values = []
  if (canPlaceZero(puzzle, size, i)) {
    values.push(0)
  }
  if (canPlaceOne(puzzle, size, i)) {
    values.push(1)
  }
  return values
}

function canPlaceZero (puzzle, size, tileIndex) {
  puzzle[tileIndex] = 0 // modify now to see if it would cause invalid state

  return isValid(getRows(puzzle, size), size, Math.floor(tileIndex / size), 0)
    && isValid(getColumns(puzzle, size), size, tileIndex % size, 0)
}

function canPlaceOne (puzzle, size, tileIndex) {
  puzzle[tileIndex] = 1 // modify now to see if it would cause invalid state

  return isValid(getRows(puzzle, size), size, Math.floor(tileIndex / size), 1)
    && isValid(getColumns(puzzle, size), size, tileIndex % size, 1)
}

function isValid (lines, size, lineIndex, v) {
  line = lines[lineIndex]

  zeroCount = line.count(v)
  if (zeroCount > size / 2) {
    return false
  }

  for (let i = 0; i < lines.length; i++) {
    if (i !== lineIndex && line.isEqualTo(lines[i])) {
      return false
    }
  }

  var count = 0
  for (let i = 0; i < line.length; i++) {
    if (line[i] === v) {
      count++
    } else {
      count = 0
    }
    if (count === 3) {
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

  let visibleSlots = new Array(solution.length)
  for (let i = 0; i < visibleSlots.length; i++) {
    visibleSlots[i] = i
  }

  while (visibleSlots.length > 0) {
    let ttrIndex = Math.floor(Math.random() * visibleSlots.length)
    let tileToRemove = visibleSlots[ttrIndex]
    
    let removedValue = solution[tileToRemove]
    
    solution[tileToRemove] = null
    possibleSolutions = solvePuzzle(solution, size)

    if (possibleSolutions > 1) {
      solution[tileToRemove] = removedValue
    }

    visibleSlots[ttrIndex] = visibleSlots[visibleSlots.length - 1]
    visibleSlots.pop()
  }

  return solution
}

function solvePuzzle (puzzle, gridSize) {
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
    possibleValues = getPossibleValues(puzzle, gridSize, nextEmptyTile)
    if (possibleValues.length > 0) {
      for (let value of possibleValues) {
        puzzle[nextEmptyTile] = value
        count += solvePuzzle(puzzle, gridSize)
      }
    }
    // reset to null because possible values will change the value
    puzzle[nextEmptyTile] = null
  }

  return count
}

module.exports = { generateValidGrid }


size = 8
puzzle = createPuzzle(size)

is = ''
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    var e = puzzle.initialState[j + i * size]
    if (e === null) {
      is += '  '
    } else {
      is += e + ' '
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