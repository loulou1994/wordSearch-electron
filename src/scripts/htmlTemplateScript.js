module.exports = (() => {
  return `
function drawCircles(numberOfWords, style, cells) {
  const firstScriptTag = document.querySelector('script');
  const circlesWrapper = document.createElement('div');
  circlesWrapper.className = 'circles-wrapper';
  const validLettersCoords = Array.from({ length: numberOfWords }, () => []);

  cells.forEach((cell) => {
    if ('wordid' in cell.dataset) {
      const cellOffsets = {
        x: cell.getBoundingClientRect().x,
        y: cell.getBoundingClientRect().y,
      };
      const numberWordIds = cell.dataset.wordid.split(' ');
      numberWordIds.forEach((worId) => {
        validLettersCoords[Number(worId) - 1].push(cellOffsets);
      });
    }
  });

  const circleW = cells[0].getBoundingClientRect().width;
  const cellsGaping = style.tableType === 'grid' ? 1 : 0;
  validLettersCoords.forEach((wordElements) => {
    const circleDiv = document.createElement('div');
    const circleH =
      circleW * wordElements.length + cellsGaping * wordElements.length;
    const deltaX = wordElements[wordElements.length - 1].x - wordElements[0].x;
    const deltaY = wordElements[wordElements.length - 1].y - wordElements[0].y;

    const angleRadians = Math.atan2(deltaY, deltaX);
    const angle = angleRadians * (180 / Math.PI);

    const radian = angle * (Math.PI / 180);
    const scaleY =
      angle % 180 === 0 || angle % 90 === 0
        ? 1
        : Math.abs(1 / Math.sin(radian));

    const styles = {
      position: \`absolute\`,
      width: \`\${circleH}px\`,
      height: \`\${circleW}px\`, //Math.abs(circleCords.y1 - circleCords.y2) + circleW
      left: \`\${wordElements[0].x}px\`,
      top: \`\${wordElements[0].y}px\`,
      rotate: \`\${angle}deg\`,
      transformOrigin: \`\${circleW / 2}px \${circleW / 2}px\`,
      border: \`\${style.circleThickness}px solid \${style.circleColor}\`,
      borderRadius: \`\${circleH}px\`,
      scale: \`\${scaleY} \${1}\`,
    };
    Object.assign(circleDiv.style, styles);
    circlesWrapper.appendChild(circleDiv);
  });
  document.body.insertBefore(circlesWrapper, firstScriptTag)
}

function showAnswsers(searchWordCells, styles) {
  if (styles.solutionGridSelect === 'circle') {
    drawCircles(styles.numOfWords, {
      circleColor: styles.circleColorInput,
      circleThickness: styles.circleThicknessSelect,
      tableType: styles.gridOutlineRadio,
    }, searchWordCells);

  } else if (styles.solutionGridSelect === 'cell') {
    searchWordCells.forEach((cell) => {
      if (!cell.dataset['wordid']) {
        cell.firstElementChild.style.visibility = 'hidden';
      }
    });
  } else {
    searchWordCells.forEach((cell) => {
      if (cell.dataset['wordid']) {
        cell.style.backgroundColor = 'gray';
      }
    });
  }
}
`;
})();
