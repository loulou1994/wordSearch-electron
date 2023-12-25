function genHtmlTemplate(wordsData, styles, showSolution = false) {
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
        --show-title: ${
          styles.titlePresence && showSolution ? "none" : "block"
        };
        --font-letter: ${styles.lettersFontSelect};
        --font-header: ${styles.headerFontSelect};
        --header-size: ${styles.headerSizeInput}px;
        --rows: ${styles.gridRowsInput};
        --cols: ${styles.gridColumnsInput};
        --with-gridlines: ${
          styles.gridOutlineRadio === "grid" ? "inherit" : "none"
        };
        --letter-size: ${styles.lettersSizeInput}px;
        --letter-weight: ${styles.lettersWeight ? "bold" : "normal"};
        --letter-clr: ${styles.lettersColorInput};
        --show-words: ${
          styles.wordsPresence && showSolution ? "none" : "block"
        };
        --font-word: ${styles.wordsSizeInput}px;
        --word-case: ${styles.wordsCasing ? "lowercase" : "uppercase"};
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
        overflow: hidden;
        font-family: var(--font-letter);
        display: grid;
        width: 100vw;
        height: 100vh;
        gap: 48px 22px;
        margin: var(--margins, 0px);
        place-content: center;
        grid-template-columns: repeat(${
          Number(styles.gridsPageSelect) > 1 ? "2" : "1"
        }, 1fr);
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

      .table-wrapper:nth-child(1) {
        grid-column: 1 / 2;
      }

      .table-wrapper:nth-child(2) {
        grid-column: 2 / 3;
      }

      .table-wrapper:nth-child(3) {
        grid-column: 1 / ${Number(styles.gridsPageSelect) === 3 ? "3" : "2"};
      }

      .table-wrapper:nth-child(4) {
        grid-column: 2 / 3;
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
        margin-block: 20px;
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
        text-align: center;
      }

      .words-container > p {
        display: var(--show-words);
      }

      .circles-wrapper {
        position: absolute;
      }
    </style>
  </head>
  <body>
    <script src="./htmlTemplateScript.js"></script>
    <script>
    const {showSolution} = ${JSON.stringify({ showSolution })};
    const setStyles = ${JSON.stringify({ ...styles })}
    const wordsWrapperStyles = ${JSON.stringify(
      styles.wordsPlacementSelect === "v"
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
    const firstScriptTag = document.querySelector('script');

    ${JSON.stringify(wordsData)}.forEach(gridData => {
      const tableWrapperEl = document.createElement('div');
      const headingTitle = document.createElement('h1');
      const tableEl = document.createElement('div');
      const wordsWrapperEl = document.createElement('div');

      tableWrapperEl.className = "table-wrapper";
      tableEl.className = "table";
      wordsWrapperEl.className = "words-container";

      headingTitle.textContent =  gridData.title;

      tableWrapperEl.appendChild(headingTitle);
      tableWrapperEl.appendChild(tableEl);
      tableWrapperEl.appendChild(wordsWrapperEl);
      document.body.insertBefore(tableWrapperEl, firstScriptTag);

      wordsWrapperEl.style.setProperty('--container-width', tableEl.offsetWidth + 'px');
      Object.assign(wordsWrapperEl.style, wordsWrapperStyles);

      const searchWordGrid = gridData.table;
      const setOfWords = gridData.words

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
      setOfWords.forEach((word) => {
        const paragraphEl = document.createElement('p');
        paragraphEl.textContent = word;
        wordsWrapperEl.appendChild(paragraphEl);
      })
    })

    if (showSolution) {
      const tableWrappers = document.querySelectorAll('.table-wrapper');
      tableWrappers.forEach((tableWrapper) => {
        const table = tableWrapper.querySelector('.table');
        const wordsContainer = tableWrapper.querySelector('.words-container');
        showAnswsers([...table.children], {...setStyles, numOfWords: wordsContainer.children.length});
      })
    }
    </script>
  </body>
</html>`;
}

module.exports = genHtmlTemplate;
