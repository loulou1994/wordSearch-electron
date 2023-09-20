function genSolutionTemplate(titleFont) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      *,
      *,
      *::after,
      *::before {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        }
        
        h1 {f
        font-family: ${titleFont};
        font-size: 70px; 
        text-align: center;
        text-transform: uppercase;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h1>SOLUTION</h1>
  </body>
</html>`;
}
module.exports = genSolutionTemplate;