import '../assets/styles/index.css';

import {
  setUpCustomSelects,
  extractInputsData,
  checkInputsdata,
  generateWordSearchData,
  closeAllSelect,
  addRow,
} from './domManipulations';

document.addEventListener('DOMContentLoaded', async () => {
  let fontsData = [];
  try {
    fontsData = await window.electronAPI.loadOsFonts();
  } catch (err) {
    // console.log('Error happened: ' + err);
    window.electronAPI.alertMessage(
      'system fonts could not be loaded for some reason. Default fonts will be used instead.'
    );
  }

  const fontsSelectInputs = document.querySelectorAll(
    'select[data-select="font"]'
  );
  fontsSelectInputs.forEach((select) => {
    fontsData.forEach((fontName) => {
      const optionEl = document.createElement('option');
      optionEl.setAttribute('value', fontName);
      optionEl.textContent = fontName;
      select.appendChild(optionEl);
    });
  });
  setUpCustomSelects();

  // navigating back to quick menu page
  const menuLinkEl = document.getElementById('menu-window');
  menuLinkEl.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.loadApp_API({ width: 526, height: 296, page: 'main' });
  });

  const addWordBtn = document.querySelector('.add-word');
  addWordBtn.addEventListener('click', addRow);

  const resetBtn = document.querySelector('#resetBtn');
  resetBtn.addEventListener('click', () => {
    location.reload();
  });

  const formEL = document.querySelector('body.app > form');
  formEL.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputsData = extractInputsData();
    const allInputsValid = checkInputsdata(inputsData);

    if (allInputsValid) {
      const wordSearchData = generateWordSearchData(inputsData);
      window.electronAPI.openDialog().then((filePath) => {
        if (!filePath) return;
        const progressBarEl = document.querySelector('.progress-bar');
        progressBarEl.style.display = 'block';
        window.electronAPI
          .convertToPDF(wordSearchData, `${filePath.replace(/\.pdf/, '')}.pdf`)
          .then(
            (succeeded) => {
              if (succeeded === true) {
                window.electronAPI.alertMessage(
                  'Pdf file generated successfully'
                );
              } else if (succeeded === false) {
                window.electronAPI.alertMessage(
                  "Some words couldn't be added. Please retry with bigger word tries value or decrease number of words"
                );
              }
              progressBarEl.style.display = 'none';
            },
            (err) => {
              window.electronAPI.alertMessage(
                'An unexpected error happened with the following message: ' +
                  err
              );
              progressBarEl.style.display = 'none';
            }
          );          
        });
    }
  });
});
document.addEventListener('click', closeAllSelect);
