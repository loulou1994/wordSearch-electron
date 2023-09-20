const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');
const PCR = require('puppeteer-chromium-resolver');

const PDFMerger = require('pdf-merger-js');

const genHtmlTemplate = require('./htmlTemplate');
const genSolutionTemplate = require('./solutionTemplate');
const genHtmlTemplateScript = require('./htmlTemplateScript');
const searchWordGenerator = require('./wordSearchGenerator');

module.exports = async function pdfGenerator(searchWordData, filePath) {
  const merger = new PDFMerger();
  const searchWordTables = [];
  for (let searchWord of searchWordData.titlesData) {
    const { GRID, allWordsAdded } = searchWordGenerator(
      {
        rows: Number(searchWordData.styling.gridRowsInput),
        cols: Number(searchWordData.styling.gridColumnsInput),
      },
      searchWord.words,
      Number(searchWordData.styling.wordTrySelect)
    );

    if (!allWordsAdded) return false;
    searchWordTables.push({
      GRID,
      allWordsAdded,
    });
  }
  const TemplatesOutputPath = path.join(app.getAppPath(), '..');
  try {
    const stats = await PCR({});
    const browser = await stats.puppeteer.launch({
      executablePath: stats.executablePath,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 816,
      height: 1056,
    });
    await fs.writeFile(
      path.join(TemplatesOutputPath, '/htmlTemplateScript.js'),
      genHtmlTemplateScript,
      'utf-8'
    );
    let htmlTemplate = '';
    let pdfFileName = '';
    let showSolution = false;
    let i = 0;
    while (i < searchWordTables.length * 2) {
      console.log(i)
      if (i === searchWordTables.length && !showSolution) {
        showSolution = true;
        htmlTemplate = genSolutionTemplate(
          searchWordData.styling.headerFontSelect
        );
      } else {
        const pageNumber =
          Math.floor(i % searchWordTables.length) + 1 > 9
            ? Math.floor(i % searchWordTables.length) + 1
            : `0${Math.floor(i % searchWordTables.length) + 1}`;

        pdfFileName = showSolution ? `solution${pageNumber}` : pageNumber;
        const wordSearchTitle = showSolution
          ? `PUZZLE ${pageNumber}`
          : searchWordData.titlesData[i % searchWordTables.length].title;

        htmlTemplate = genHtmlTemplate(
          {
            table: searchWordTables[i % searchWordTables.length].GRID,
            ...searchWordData.titlesData[i % searchWordTables.length],
            title: wordSearchTitle,
          },
          searchWordData.styling,
          showSolution
        );
        i++;
      }
      // path.join(__dirname, '..', '..', 'template.html'),
      await fs.writeFile(
        path.join(TemplatesOutputPath, '/template.html'),
        htmlTemplate,
        'utf-8'
      );
      // ${path.join(__dirname, '..', '..', 'template.html')}
      await page.goto(
        `file://${path.join(TemplatesOutputPath, '/template.html')}`,
        {
          waitUntil: 'domcontentloaded',
        }
      );
      await page.pdf({
        path: path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`),
        format: 'letter',
        scale: 1,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
        printBackground: true,
      });
      await merger.add(
        path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`)
      );
      await fs.unlink(
        path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`)
      );
    }
    // for (let i = 0; i < searchWordTables.length * 2 + 1; ++i) {
    // }
    const mergedPdfBuffer = await merger.saveAsBuffer();
    await fs.writeFile(filePath, mergedPdfBuffer, 'utf-8', (err) => {
      throw new Error(`Error while saving file: ${err}`);
    });

    await fs.unlink(path.join(TemplatesOutputPath, '/htmlTemplateScript.js'));
    await fs.unlink(path.join(TemplatesOutputPath, '/template.html'));
    await browser.close();
    return true;
  } catch (err) {
    throw new Error(err);
  }
};