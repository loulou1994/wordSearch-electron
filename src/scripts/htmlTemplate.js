function genHtmlTemplate(wordsData, styles, showSolution=false) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      :root {
        --margins: ${styles.pageMarginsInput}in;
        --show-title: ${styles.titlePresence && showSolution ? 'none' : 'block'};
        --font-letter: ${styles.lettersFontSelect};
        --font-header: ${styles.headerFontSelect};
        --header-size: ${styles.headerSizeInput}px;
        --rows: ${styles.gridRowsInput};
        --cols: ${styles.gridColumnsInput};
        --with-gridlines: ${
          styles.gridOutlineRadio === 'grid' ? 'inherit' : 'none'
        };
        --letter-size: ${styles.lettersSizeInput}px;
        --letter-weight: ${styles.lettersWeight ? 'bold' : 'normal'};
        --letter-clr: ${styles.lettersColorInput};
        --show-words: ${styles.wordsPresence && showSolution ? 'none' : 'block'};
        --font-word: ${styles.wordsSizeInput}px;
        --word-case: ${styles.wordsCasing ? 'lowercase' : 'uppercase'};
      }

      *,
      *,
      *::after,
      *::before {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: var(--font-letter);
        padding: var(--margins, 0.625in);
      }

      /* formula to convert incoming inch to pixel to match: calc((incoming inch / 96) * 300)*/
      .table-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        /*   min-height: 100vh; */
        /*   padding: calc((0.90667in / 96) * 300); */
      }

      h1 {
        display: var(--show-title, block);
        font-size: var(--header-size); 
        text-align: center;
        text-transform: uppercase;
        font-weight: bold;
      }

      h1, .words-container {
        font-family: var(--font-header, initial);        
      }

      .table {
        display: grid;
        margin-block: 0.39583in;
        grid-template-columns: repeat(var(--cols), minmax(30px, 1fr));
        grid-template-rows: repeat(var(--rows), 1fr);
        gap: var(--with-gridlines, 1px);
        font-size: var(--letter-size, 0.1667in);
        text-transform: uppercase;
        font-weight: var(--letter-weight);
        color: var(--letter-clr, black);
        border: 2px solid #000;
        background-color: var(--with-gridlines, black);
      }

      .table > .cell {
        display: flex;
        aspect-ratio: 1;
        line-height: 1;
        background-color: #fff;
      }

      .cell > p {
        margin: auto;
      }

      .words-container {
        width: var(--container-width, auto);
        margin-inline: auto;
        gap: 1rem;
        font-size: var(--font-word, 0.2083in);
        text-transform: var(--word-case, initial);
        font-weight: bold;
      }

      .words-container > p {
        display: var(--show-words);
      }
    </style>
  </head>
  <body>
    <div class="table-wrapper">
      <h1>${wordsData.title}</h1>
      <div class="table"></div>
    </div>
    <div class="words-container">
    </div>
    <script src="./htmlTemplateScript.js"></script>
    <script>
    const tableEl = document.querySelector('.table');
    const wordsContainer = document.querySelector('.words-container');
    const searchWordGrid = ${JSON.stringify(wordsData.table)};
    const {showSolution} = ${JSON.stringify({ showSolution })};

      wordsContainer.style.setProperty('--container-width', tableEl.offsetWidth + 'px');
      const wordsContainerStyles = ${JSON.stringify(
        styles.wordsPlacementSelect === 'v'
          ? {
              display: `grid`,
              gridTemplateColumns: `repeat(3, 1fr)`,
              justifyItems: `flex-start`,
            }
          : {
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `flex-start`,
            }
      )};
      Object.assign(wordsContainer.style, wordsContainerStyles)

      searchWordGrid.forEach((row) => {
        row.forEach((col) => {
          const column = document.createElement('div');
          const paragraphEl = document.createElement('p');
          column.setAttribute('class', 'cell');
          const wordId = column.getAttribute('data-wordId') ?  column.getAttribute('data-wordId') + ' ' : '';
          col.wordId.length && column.setAttribute('data-wordId', col.wordId.join(' '));
          paragraphEl.textContent = col.letter;
          column.appendChild(paragraphEl);
          tableEl.appendChild(column);
        });
      });

      ${JSON.stringify(wordsData.words)}.forEach((word) => {
        const paragraphEl = document.createElement('p');
        paragraphEl.textContent = word;
        wordsContainer.appendChild(paragraphEl);
      })
      if (showSolution){
        showAnswsers([...tableEl.children], ${JSON.stringify({
          ...styles,
          numOfWords: wordsData.words.length,
        })});
      }
    </script>
  </body>
</html>`;
}

module.exports = genHtmlTemplate;