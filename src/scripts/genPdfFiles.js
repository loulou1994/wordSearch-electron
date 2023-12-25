const fs = require("fs").promises;
const path = require("path");
const { app } = require("electron");
const PCR = require("puppeteer-chromium-resolver");

const PDFMerger = require("pdf-merger-js");

const genHtmlTemplate = require("./htmlTemplate");
const genSolutionTemplate = require("./solutionTemplate");
const genHtmlTemplateScript = require("./htmlTemplateScript");
const searchWordGenerator = require("./wordSearchGenerator");

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
      Number(searchWordData.styling.wordTrySelect),
      searchWordData.styling.languageListSelect
    );

    if (!allWordsAdded) return false;
    searchWordTables.push({
      GRID,
      allWordsAdded,
    });
  }
  const TemplatesOutputPath = path.join(app.getAppPath(), "..");
  try {
    const stats = await PCR({});
    const browser = await stats.puppeteer.launch({
      headless: false,
      executablePath: stats.executablePath,
      args: [
        "--start-maximized",
        "disable-gpu",
        "--disable-infobars",
        "--disable-extensions",
        "--ignore-certificate-errors",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 816,
      height: 1056,
    });
    await fs.writeFile(
      path.join(TemplatesOutputPath, "/htmlTemplateScript.js"),
      genHtmlTemplateScript,
      "utf-8"
    );
    let htmlTemplate = "";
    let pdfFileName = "";
    let showSolution = false;
    let setOfGrids = [];
    let i = 0;
    let solutionNumbering = 0;
    while (i < searchWordTables.length * 2) {
      if (i === searchWordTables.length && !showSolution) {
        showSolution = true;
        htmlTemplate = genSolutionTemplate(
          searchWordData.styling.headerFontSelect
        );
        pdfFileName = "solution-page";
        await createPDFfile(merger, htmlTemplate, page, pdfFileName);
      } else if (showSolution) {
        solutionNumbering++;
        setOfGrids.push({
          table: searchWordTables[i % searchWordTables.length].GRID,
          ...searchWordData.titlesData[i % searchWordTables.length],
          title: `PUZZLE ${String(solutionNumbering).padStart(2, "0")}`,
        });

        if (
          setOfGrids.length === Number(searchWordData.styling.gridsPageSelect)
        ) {
          htmlTemplate = genHtmlTemplate(
            setOfGrids,
            searchWordData.styling,
            showSolution
          );
          pdfFileName = `solution-${(i % searchWordTables.length) + 1}`;
          await createPDFfile(merger, htmlTemplate, page, pdfFileName, {
            gridsPerPage: searchWordData.styling.gridsPageSelect,
            numOfRows: searchWordData.styling.gridRowsInput,
            numOfCols: searchWordData.styling.gridColumnsInput,
          }); //
          setOfGrids = [];
        }
        i++;
      } else {
        setOfGrids.push({
          table: searchWordTables[i % searchWordTables.length].GRID,
          ...searchWordData.titlesData[i % searchWordTables.length],
          title: searchWordData.titlesData[i % searchWordTables.length].title,
        });
        htmlTemplate = genHtmlTemplate(setOfGrids, {
          ...searchWordData.styling,
          gridsPageSelect: 1,
        }); // styles.gridsPageSelect
        pdfFileName = `puzzle-${(i % searchWordTables.length) + 1}`;
        await createPDFfile(merger, htmlTemplate, page, pdfFileName);
        setOfGrids = [];
        i++;
      }
    }
    const mergedPdfBuffer = await merger.saveAsBuffer();
    await fs.writeFile(filePath, mergedPdfBuffer, "utf-8", (err) => {
      throw new Error(`Error while saving file: ${err}`);
    });

    await fs.unlink(path.join(TemplatesOutputPath, "/htmlTemplateScript.js"));
    await fs.unlink(path.join(TemplatesOutputPath, "/template.html"));

    // await browser.close();
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

const createPDFfile = async (
  merger,
  htmlTemplate,
  browserPage,
  pdfFileName,
  pageStyleData = null
) => {
  const TemplatesOutputPath = path.join(app.getAppPath(), "..");
  // path.join(__dirname, '..', '..', 'template.html'),
  await fs.writeFile(
    path.join(TemplatesOutputPath, "/template.html"),
    htmlTemplate,
    "utf-8"
  );
  // ${path.join(__dirname, '..', '..', 'template.html')}
  await browserPage.goto(
    `file://${path.join(TemplatesOutputPath, "/template.html")}`,
    {
      waitUntil: "domcontentloaded",
    }
  );
  // await browserPage.evaluate((pageStyling) => {
  //   let zoomLevel = 1;

  //   if (pageStyling && Number(pageStyling.gridsPerPage) > 1) {
  //     const columns = Number(pageStyling.numOfCols);
  //     const rows = Number(pageStyling.numOfRows);

  //     if (rows > 16 || columns > 16) zoomLevel = 0.65;
  //     else if (rows > 11 || columns > 11) zoomLevel = 0.75;
  //   }

  //   document.body.style.zoom = zoomLevel;
  // }, pageStyleData);

  await browserPage.pdf({
    path: path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`),
    format: "letter",
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
    printBackground: true,
    pageRanges: "1",
  });
  await merger.add(
    path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`)
  );
  await fs.unlink(
    path.join(TemplatesOutputPath, `wordSearch-${pdfFileName}.pdf`)
  );
};
