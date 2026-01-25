(function () {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let direction = { x: 1, y: 0 };
    let food = spawnFood();
    let score = 0;
    let gameOver = false;

    /* 从 CSS 变量中读取颜色 */
    function getCssVar(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
    }

    function spawnFood() {
        return {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }

    function update() {
        if (gameOver) return;

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount
        ) {
            endGame();
            return;
        }

        for (let part of snake) {
            if (part.x === head.x && part.y === head.y) {
                endGame();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            food = spawnFood();
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const snakeColor = getCssVar("--snake-color-body") || "lime";
        const foodColor = getCssVar("--snake-color-food") || "red";
        const textColor = getCssVar("--snake-text-main");

        // 蛇
        ctx.fillStyle = snakeColor;
        for (let part of snake) {
            ctx.fillRect(
                part.x * gridSize,
                part.y * gridSize,
                gridSize - 1,
                gridSize - 1
            );
        }

        // 食物
        ctx.fillStyle = foodColor;
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );

        // 分数
        ctx.fillStyle = textColor;
        ctx.font = "14px Arial";
        ctx.fillText("Score: " + score, 10, 20);

        if (gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = textColor;
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2);
            ctx.font = "16px Arial";
            ctx.fillText("刷新页面重新开始", canvas.width / 2, canvas.height / 2 + 30);
            ctx.textAlign = "left";
        }
    }

    function endGame() {
        gameOver = true;
    }

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp":
                if (direction.y === 0) direction = { x: 0, y: -1 };
                break;
            case "ArrowDown":
                if (direction.y === 0) direction = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                if (direction.x === 0) direction = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                if (direction.x === 0) direction = { x: 1, y: 0 };
                break;
        }
    });

    function gameLoop() {
        update();
        draw();
    }

    setInterval(gameLoop, 120);

})();