// mimicking the behavior of an html select field by creating a custom one for each one.
export function setUpCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");

  for (let i = 0; i < customSelects.length; ++i) {
    const select = customSelects[i].querySelector("select");
    const selectLength = select.length;
    const selectedElement = document.createElement("div");
    selectedElement.setAttribute("class", "select-selected");
    selectedElement.innerHTML = select.options[select.selectedIndex].innerHTML;

    customSelects[i].appendChild(selectedElement);
    const customSelectWrapper = document.createElement("div");
    customSelectWrapper.setAttribute("class", "select-items select-hide");

    for (let j = 0; j < selectLength; ++j) {
      const item = document.createElement("div");
      item.innerHTML = select.options[j].innerHTML;

      item.addEventListener("click", () => {
        select.selectedIndex = j;
        selectedElement.innerHTML = item.innerHTML;
        const currentSelectedItem =
          customSelectWrapper.querySelector(".same-as-selected");
        currentSelectedItem && currentSelectedItem.removeAttribute("class");
        item.setAttribute("class", "same-as-selected");
        selectedElement.click();
      });
      customSelectWrapper.appendChild(item);
    }
    customSelects[i].appendChild(customSelectWrapper);

    selectedElement.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllSelect(customSelectWrapper);
      selectedElement.nextElementSibling.classList.toggle("select-hide");
    });
  }
}

// close all custom select fields either on the click of custom select or anywhere inside the page
export function closeAllSelect(elementSelected) {
  const itemsWrappers = document.querySelectorAll(".select-items");
  itemsWrappers.forEach((itemsWrapper) => {
    if (!elementSelected || itemsWrapper !== elementSelected) {
      itemsWrapper.classList.add("select-hide");
    }
  });
}

// add a row to the word list table
export function addRow(e) {
  e.preventDefault();
  const wordListContainer = document.querySelector(".words-list-table > tbody");
  const tr = document.createElement("tr");
  const inputs = ["word", "title"];
  for (let i = 0; i < inputs.length; ++i) {
    const td = document.createElement("td");
    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "text");
    inputEl.setAttribute("value", "");
    inputEl.setAttribute("name", inputs[i]);
    td.appendChild(inputEl);
    tr.appendChild(td);
  }
  wordListContainer.appendChild(tr);
}

export function extractInputsData() {
  const elementsSelectors = [
    "words-numberSelect",
    "words-placementSelect",
    "letters-colorInput",
    "circle-colorInput",
    "letters-fontSelect",
    "letters-sizeInput",
    "letters-weight",
    "header-fontSelect",
    "header-sizeInput",
    "words-sizeInput",
    "grid-rowsInput",
    "grid-columnsInput",
    "gridOutlineRadio", //outline-style
    "words-casing",
    "page-marginsInput",
    "circle-thicknessSelect",
    "title-presence",
    "words-presence",
    "word-trySelect",
    "word",
    "title",
    "solution-gridSelect",
    "grids-pageSelect",
    "language-listSelect",
  ];
  const inputValues = {};
  for (let i = 0; i < elementsSelectors.length; ++i) {
    const inputSelectorString = elementsSelectors[i];
    const inputSelector = inputSelectorString.replace(
      /(Select|Radio|Input)/,
      ""
    );

    const inputKey = inputSelectorString.replace(
      /-./,
      inputSelectorString[inputSelectorString.indexOf("-") + 1].toUpperCase()
    );
    inputValues[inputKey] = !inputSelector.match(/-/)
      ? document.getElementsByName(inputSelector)
      : document.getElementById(inputSelector).type === "checkbox"
      ? document.getElementById(inputSelector).checked
      : document.getElementById(inputSelector).value;
  }

  const {
    word: wordElements,
    title: titleElements,
    wordsNumberSelect: wordsNumber,
    gridOutlineRadio,
    ...rest
  } = inputValues;

  const titles = [];
  const words = [];
  const alphabetsPatterns = new Map([
    [
      "latin",
      /^[a-zA-Z]{2,}([- ]?[a-zA-Z]{2,})?(,[a-zA-Z]+([- ]?[a-zA-Z]{2,})?)*$/,
    ],
    [
      "arabic",
      /^[\u0600-\u06FF]{2,}([- ]?[\u0600-\u06FF]{2,})?(,[\u0600-\u06FF]{2,}([- ]?[\u0600-\u06FF]{2,})?)*$/,
    ],
  ]);
  const chosenAlphabetPattern = alphabetsPatterns.get(rest.languageListSelect);

  titleElements.forEach((titleElement) => {
    if (titleElement.value) {
      titles.push(titleElement.value);
    }
  });

  wordElements.forEach((wordElement) => {
    const stringIsValid = validateStringOfWords(
      wordElement.value,
      chosenAlphabetPattern
    );

    console.log(stringIsValid);
    if (stringIsValid) {
      words.push(wordElement.value.split(","));
    }
  });

  return {
    wordsData: {
      words,
      titles,
      wordsNumber: Number(wordsNumber),
    },
    styles: {
      ...rest,
      gridOutlineRadio:
        !gridOutlineRadio[0].checked && !gridOutlineRadio[1].checked
          ? "none"
          : gridOutlineRadio[0].checked
          ? "grid"
          : "outline",
    },
  };
}

export function checkInputsdata(formInputs) {
  const inputsKeys = Object.keys(formInputs.styles);

  // Checking all input, select, checkboxes and radios form fields for valid values
  for (let inputEl of inputsKeys) {
    if (
      (inputEl.indexOf("Select") !== -1 &&
        formInputs.styles[inputEl] === "empty") ||
      (inputEl.indexOf("Input") !== -1 && !formInputs.styles[inputEl]) ||
      (inputEl.indexOf("Radio") !== -1 &&
        !formInputs.styles[inputEl] === "none")
    ) {
      window.electronAPI.alertMessage(
        "An error was found. Please check if the input fields for the setting of the word search table are correctly filled"
      );
      return false;
    }
  }

  return wordsAndTitlesValidation(formInputs);
}

export function generateWordSearchData(formInputs) {
  const words = [].concat(...formInputs.wordsData.words);
  // create an array of title objects that have name of title with its set of search words
  const wordsAndTitles = [];
  let wordsPerNumber = [];
  let counter = 0;

  for (let i = 0; i < words.length; i++) {
    counter++;
    wordsPerNumber.push(words[i]);

    if (counter >= formInputs.wordsData.wordsNumber) {
      wordsAndTitles.push({
        title: formInputs.wordsData.titles[(i + 1) / counter - 1],
        words: wordsPerNumber,
      });
      wordsPerNumber = [];
      counter = 0;
    }
  }

  // create a new object to separate between words data and how the pdf's page should be rendered.
  return { titlesData: wordsAndTitles, styling: { ...formInputs.styles } };
}

function wordsAndTitlesValidation(formData) {
  const {
    wordsData: { words: listsOfWords, titles, wordsNumber },
    styles: { gridRowsInput, gridColumnsInput, gridsPageSelect },
  } = formData;
  let allWordCountEqual = true;
  let allTitleCountEqual = true;

  // check if the number of entered search word tables fits in the document format display ie grids per page
  if (titles.length % Number(gridsPageSelect) !== 0) {
    window.electronAPI.alertMessage(
      "The number of suggested search word boards doesn't seem to fit in the selected document format display"
    );
    return false;
  }

  // if either title or words fields are empty, stop further operation
  if (listsOfWords.length === 0 || titles.length === 0) {
    window.electronAPI.alertMessage(
      "Either one or both title and words input fields have no values. Add valid words to both entries"
    );
    return false;
  }

  // checking if a title input field has more or less number of titles than expected
  if (titles.length !== listsOfWords.length) allTitleCountEqual = false;

  // checking if a word input field has more or less number of words than expected
  listsOfWords.forEach((wordsList) => {
    if (wordsList.length !== wordsNumber) allWordCountEqual = false;
  });

  if (!allWordCountEqual || !allTitleCountEqual) {
    window.electronAPI.alertMessage(
      "An error was found. Please check your title and words columns if they are correctly filled"
    );
    return false;
  }

  let wordIsTooLong = false;
  listsOfWords.forEach((listOfWord) => {
    listOfWord.forEach((word) => {
      if (
        word.length > Number(gridRowsInput) ||
        word.length > Number(gridColumnsInput)
      )
        wordIsTooLong = true;
    });
  });

  if (wordIsTooLong) {
    window.electronAPI.alertMessage(
      "Word is either greater than row's or column's length. Please enter words that are lesser than or equal to your defined dimensions"
    );
    return false;
  }
  return true;
}

function validateStringOfWords(string, chosenPattern) {
  // const stringPattern =
  //   /^[a-zA-Z]{2,}([- ]?[a-zA-Z]{2,})?(,[a-zA-Z]+([- ]?[a-zA-Z]+)?)*$/;
  const trimmedString = string.trim();

  if (chosenPattern.test(trimmedString)) return true;
  return false;
}
