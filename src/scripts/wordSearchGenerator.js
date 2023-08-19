module.exports = (() => {
  const DIRECTIONS = [0, 1, 2, 3, 4, 5, 6, 7];
  const DR = [-1, -1, -1, 0, 0, 1, 1, 1];
  const DC = [-1, 0, 1, -1, 1, -1, 0, 1];
  let GRID = [];

  function generateWordsGrid(rows, cols) {
    GRID = JSON.parse(
      JSON.stringify(
        Array.from({ length: rows }, () =>
          Array(cols).fill({
            wordId: [],
            letter: '',
            filled: false,
          })
        )
      )
    );
  }

  function isSafeToPlace(word, row, col, direction) {
    const rows = GRID.length;
    const cols = GRID[0].length;

    const numOfIntersectingWords = [];
    for (let i = 0; i < word.length; ++i) {
      const r = row + i * DR[direction];
      const c = col + i * DC[direction];

      if (r < 0 || r >= rows || c < 0 || c >= cols) {
        return false;
      }

      const { wordId } = GRID[r][c];
      if (
        (GRID[r][c].filled && GRID[r][c].letter !== word[i]) ||
        numOfIntersectingWords.includes(...wordId)
      ) {
        return false;
      }

      if (GRID[r][col].filled) {
        numOfIntersectingWords.push(...wordId);
      }
    }
    return true;
  }

  function placeWord(wordsList, attempts) {
    const rows = GRID.length;
    const cols = GRID[0].length;
    let countWords = 0;

    for (const word of wordsList) {
      let wordIsPlaced = false;
      for (let i = 0; i < attempts; ++i) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const direction =
          DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        // console.log(isSafeToPlace(word, row, col, direction))
        wordIsPlaced = isSafeToPlace(word, row, col, direction);
        if (wordIsPlaced) {
          countWords++;
          for (let j = 0; j < word.length; ++j) {
            const r = row + j * DR[direction];
            const c = col + j * DC[direction];
            // console.log(word[j], r, c, word.length);
            GRID[r][c].filled = true;
            GRID[r][c].wordId.push(countWords);
            GRID[r][c].letter = word[j];
          }
          break;
        }
      }
      if (!wordIsPlaced){
        return false
      }
    }
    return true
  }

  function addRandomLetter() {
    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    GRID.forEach((row) => {
      row.forEach((col) => {
        if (!col.filled) {
          col.filled = true;
          col.letter = letters[Math.floor(Math.random() * letters.length)];
        }
      });
    });
  }

  function setUpGrid(gridDimensions, wordsList, fitWordAttemps) {
    let allWordsAdded = true;
    generateWordsGrid(gridDimensions.rows, gridDimensions.cols);
    if (!placeWord(wordsList, fitWordAttemps)) {
      allWordsAdded = false;
    }
    addRandomLetter();
    return { GRID, allWordsAdded };
  }

  return setUpGrid;
})();
