function getRandomVelocity(min, max) {
  // Generate a random velocity between min and max, including direction
  const speed = Math.random() * (max - min) + min;
  return Math.random() < 0.5 ? -speed : speed; // Randomly assign negative or positive
}

function changeBorderColor(borders, borderIndex, app) {
  return new Promise((resolve) => {
    borders[borderIndex].clear();
    borders[borderIndex].beginFill(0xffffff); // Change to white
    if (borderIndex === 0)
      borders[borderIndex].drawRect(0, 0, app.screen.width, 10); // Top
    else if (borderIndex === 1)
      borders[borderIndex].drawRect(
        0,
        app.screen.height - 10,
        app.screen.width,
        10
      );
    // Bottom
    else if (borderIndex === 2)
      borders[borderIndex].drawRect(0, 0, 10, app.screen.height); // Left
    else
      borders[borderIndex].drawRect(
        app.screen.width - 10,
        0,
        10,
        app.screen.height
      ); // Right
    borders[borderIndex].endFill();
    resolve(); // Indicate that the border color change is complete
  });
}

function waitForAllBordersHit(hitBorders) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (hitBorders.size === 4) {
        clearInterval(interval);
        resolve("All borders hit! Game Over.");
      }
    }, 100); // Check every 100ms
  });
}

function setupGame() {
  return new Promise((resolve) => {
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x0000ff,
    });
    document.body.appendChild(app.view);

    const borders = [];
    const borderColors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff];
    const borderThickness = 10;

    for (let i = 0; i < 4; i++) {
      const border = new PIXI.Graphics();
      border.beginFill(borderColors[i]);
      if (i === 0)
        border.drawRect(0, 0, app.screen.width, borderThickness); // Top
      else if (i === 1)
        border.drawRect(
          0,
          app.screen.height - borderThickness,
          app.screen.width,
          borderThickness
        );
      // Bottom
      else if (i === 2)
        border.drawRect(0, 0, borderThickness, app.screen.height); // Left
      else
        border.drawRect(
          app.screen.width - borderThickness,
          0,
          borderThickness,
          app.screen.height
        ); // Right
      border.endFill();
      borders.push(border);
      app.stage.addChild(border);
    }

    const circle = new PIXI.Graphics();
    circle.beginFill(0xffffff); // White circle
    circle.drawCircle(0, 0, 15);
    circle.endFill();
    circle.x = app.screen.width / 2;
    circle.y = app.screen.height / 2;
    app.stage.addChild(circle);

    resolve({ app, borders, circle });
  });
}

function runGame() {
  setupGame()
    .then(({ app, borders, circle }) => {
      return new Promise((resolve) => {
        // Randomize initial velocity and direction
        let velocityX = getRandomVelocity(2, 6); // Random velocity between 2 and 6
        let velocityY = getRandomVelocity(2, 6);
        const hitBorders = new Set(); // Track hit borders, but do not prevent bouncing

        app.ticker.add(() => {
          // Move the circle
          circle.x += velocityX;
          circle.y += velocityY;

          // Ensure proper position update to avoid getting stuck at edges
          const buffer = 2; // Small buffer to prevent getting stuck at borders

          // Check top border
          if (circle.y - 15 <= buffer && !hitBorders.has("top")) {
            velocityY *= -1; // Reverse direction
            hitBorders.add("top");
            circle.y = 15 + buffer; // Move the ball slightly away from the border
            changeBorderColor(borders, 0, app);
          }
          // Check bottom border
          if (
            circle.y + 15 >= app.screen.height - buffer &&
            !hitBorders.has("bottom")
          ) {
            velocityY *= -1;
            hitBorders.add("bottom");
            circle.y = app.screen.height - 15 - buffer; // Move the ball slightly away from the border
            changeBorderColor(borders, 1, app);
          }
          // Check left border
          if (circle.x - 15 <= buffer && !hitBorders.has("left")) {
            velocityX *= -1;
            hitBorders.add("left");
            circle.x = 15 + buffer; // Move the ball slightly away from the border
            changeBorderColor(borders, 2, app);
          }
          // Check right border
          if (
            circle.x + 15 >= app.screen.width - buffer &&
            !hitBorders.has("right")
          ) {
            velocityX *= -1;
            hitBorders.add("right");
            circle.x = app.screen.width - 15 - buffer; // Move the ball slightly away from the border
            changeBorderColor(borders, 3, app);
          }

          // Ensure that the ball keeps bouncing off the same borders if needed
          if (circle.x - 15 <= 0 || circle.x + 15 >= app.screen.width) {
            velocityX *= -1; // Bounce on left/right
          }

          if (circle.y - 15 <= 0 || circle.y + 15 >= app.screen.height) {
            velocityY *= -1; // Bounce on top/bottom
          }
        });

        waitForAllBordersHit(hitBorders).then((message) => {
          resolve({ app, message });
        });
      });
    })
    .then(({ app, message }) => {
      alert(message);
      app.ticker.stop(); // Stop the game after all borders are hit
    })
    .catch((error) => {
      console.error("Error in the game loop:", error);
    });
}

runGame();
