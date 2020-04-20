const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

class GameSettings {
    static init() {
        let particle_setting = localStorage.getItem("particles");
        if (particle_setting != null) {
            GameSettings.particles_enabled = particle_setting == "true";
            document.getElementById("disable_particle_button").innerHTML = (GameSettings.particles_enabled ? "Disable" : "Enable") + " Particles";
        }
    }
}

GameSettings.particles_enabled = true;
GameSettings.particles_reduced = false;
GameSettings.debug = false;

class Game {
    constructor() {
        this.engine = Matter.Engine.create({
            positionIterations: 6,
            velocityIterations: 4
        });
        GameSettings.init();
        Game.world = this.engine.world;
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
        this.runner.enabled = false;
        this.floor = new Ground(Game.world);

        this.walls = [
            new Rectangle(Game.world, WIDTH + 50, 500, 100, HEIGHT + 500, {
                isStatic: true,
                friction: 100000,
                label: "wall"
            }), new Rectangle(Game.world, -50, 500, 100, HEIGHT + 500, {
                isStatic: true,
                friction: 100000,
                label: "wall"
            }), new Rectangle(Game.world, WIDTH / 2, -50, WIDTH, 100, {
                isStatic: true,
                friction: 100000,
                label: "ceiling"
            })
        ];
        this.coinsInLevel = 0;
        this.boostsInLevel = 0;
        this.boostCount = 0;
        this.levelNumber = 0;
        this.levelTime = 0;
        this.startTime = 0;
        this.defaultResetTimeout = 5000;
        this.resetTimeout = this.defaultResetTimeout;

        this.explosions = [];

        this.cup = new Cup(Game.world);

        this.clouds = new Clouds(textures.cloud_tiny);
        this.keyboard = new Keyboard();

        this.player = new Player(Game.world, this.engine, this);
        this.win = false;
        this.gameOver = false;
        this.paused = true;
        this.firstFrame = true;
        this.playing = false;
        this.escapeLock = false;
        this.cloudsEnabled = true;



        this.setupLevel();
        this.hud = new HUD(this);
        this.levelManager = new LevelManager(this);
        this.levelSelectionMode = false;
        this.tutorial_seen = localStorage.getItem("tutorial") == "true";
    }

    onclick(e) {
        if (this.levelSelectionMode) {
            let mx = mouseX;
            let my = mouseY;
            if (mx < 600 && mx > 200 && my < 600 && my > 150) {
                mx = Math.floor((mx - 200) / 100);
                my = Math.floor((my - 150) / 100);
                let hovered = my * 4 + mx;
                if (this.levelManager.custom_level_names.length > hovered) {
                    this.levelManager.selectMyLevel(this.levelManager.custom_level_names[hovered]);
                }
            }
        }
    }

    showLevelSelect() {
        this.levelManager.loadMyLevels();
        this.levelSelectionMode = true;
        this.pause();
        this.hideOverlay();
    }

    setupLevel() {
        this.level = new Level(levels[this.levelNumber]);

    }

    disableParticles() {
        GameSettings.particles_enabled = !GameSettings.particles_enabled;
        document.getElementById("disable_particle_button").innerHTML = (GameSettings.particles_enabled ? "Disable" : "Enable") + " Particles";
        localStorage.setItem("particles", GameSettings.particles_enabled);
        this.player.particles_enabled = GameSettings.particles_enabled;
    }


    start() {
        if (!this.gameOver) {
            if (!this.tutorial_seen) {
                toggleHelp();
                this.tutorial_seen = true;
            } else {
                this.paused = false;
                this.playing = true;
                this.hideOverlay();
                this.runner.enabled = true;
            }
        } else if (this.levelSelectionMode) {
            this.hideOverlay();
        } else {
            this.restart();
        }
    }

    hideOverlay() {
        document.getElementById("overlay").style.display = "none";
    }

    showOverlay() {
        document.getElementById("overlay").style.display = "block";
    }

    nextLevel() {
        this.levelNumber++;
        if (this.levelNumber < levels.length) {
            this.reset();
            this.runner.enabled = true;
        }
    }

    pause() {
        document.getElementById("start_button").innerHTML = "Resume";
        document.getElementById("header").innerHTML = "Paused";
        document.getElementById("restart_button").style.display = "block";
        this.paused = true;
        this.runner.enabled = false;
        this.showOverlay();
    }

    restart() {
        document.getElementById("start_button").innerHTML = "Start";
        document.getElementById("header").innerHTML = "Menu";
        document.getElementById("restart_button").style.display = "none";
        levels = default_levels;
        this.levelNumber = 0;
        this.player.score = 0;
        this.reset();
        this.pause();
        //this.hideOverlay();
    }

    youWin() {
        document.getElementById("header").innerHTML = "YOU WIN :0";
        document.getElementById("start_button").innerHTML = "Restart";
        document.getElementById("restart_button").style.display = "none";
        this.showOverlay();
    }

    reset() {
        this.levelTime = this.startTime;
        this.startTime = 0;
        this.gameOver = false;
        this.player.reset();
        for (let obstacle of this.level.scenes[0].layers[0].obstacles) {
            obstacle.remove();
        }
        for (let coin of this.level.scenes[0].layers[0].coins) {
            if (!coin.removed) {
                coin.remove();
                this.player.missedCoins++;
            }
        }
        for (let boost of this.level.scenes[0].layers[0].boosts) {
            if (!boost.removed) {
                boost.remove();
                this.player.missedBoosts++;
            }
        }
        for (let spikes of this.level.scenes[0].layers[0].spikes) {
            if (!spikes.removed) {
                spikes.remove();
            }
        }
        for (let angel_coin of this.level.scenes[0].layers[0].angel_coins) {
            if (!angel_coin.removed) {
                angel_coin.remove();
            }
        }
        for (let balloon of this.level.scenes[0].layers[0].balloons) {
            if (!balloon.removed) {
                balloon.remove();
            }
        }
        this.cup.reset();
        this.setupLevel();
        this.resetTimeout = this.defaultResetTimeout;
        this.paused = false;
        this.win = false;
    }

    grid() {
        for (let i = 0; i < WIDTH; i += 50) {
            line(i, 0, i, HEIGHT);
        }
        for (let i = 0; i < HEIGHT; i += 50) {
            line(0, i, WIDTH, i);
        }
    }

    newExplosion(x, y, color) {
        if (GameSettings.particles_enabled) {
            this.explosions.push(new Explosion(x, y, color));
        }
    }

    renderExplosions() {
        for (let e = this.explosions.length - 1; e >= 0; e--) {
            let explosion = this.explosions[e];
            explosion.render();
            if (explosion.dead) {
                this.explosions.splice(e, 1);
            }
        }
    }

    render() {

        //if (!this.paused && !this.firstFrame) return;
        ParticleTrail.particle_count = 0;
        ParticleTrail.existing_trails = 0;
        if (!this.paused) {
            //Matter.Engine.update(this.engine, deltaTime, deltaTime / this.lastDelta);
            if (this.player.body.position.x > WIDTH || this.player.body.position.x < 0 || this.player.body.position.y > HEIGHT || this.player.body.position.y < 0) {
                this.player.reset();
            }
            this.levelTime += deltaTime;
        }
        this.lastDelta = deltaTime;
        //background(135, 206, 235);
        clear();
        if (GameSettings.debug) this.grid();
        if (!this.paused) {
            if (this.keyboard.isKeyDown(68)) {
                this.player.move(RIGHT);
            }
            if (this.keyboard.isKeyDown(65)) {
                this.player.move(LEFT);
            }
            if (this.keyboard.isKeyDown(" ")) {
                this.player.jump(this.keyboard.shift);
            }
        }
        if (this.keyboard.lifted.indexOf(65) !== -1) {
            this.player.woosh.left = true;
        }
        if (this.keyboard.lifted.indexOf(68) !== -1) {
            this.player.woosh.right = true;
        }
        if (this.keyboard.isKeyDown(27)) {
            if (!this.escapeLock) {
                if (this.resetTimeout == this.defaultResetTimeout) {
                    if (!this.paused) this.pause();
                    else if (this.playing) this.start();
                    else if (this.levelSelectionMode) {
                        this.pause();
                        this.levelSelectionMode = false;
                    }
                }
                this.escapeLock = true;
            }
        } else {
            this.escapeLock = false;
        }
        //if (this.cloudsEnabled) this.clouds.render();
        this.clouds.render();
        this.floor.render();
        for (let wall of this.walls) {
            wall.render();
        }
        this.level.render();

        this.cup.render();
        if (!this.paused) this.player.update();
        this.player.render();
        this.renderExplosions();

        if (this.win && !this.gameOver) {
            fill(0, 50);
            rect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
            /* fill(0, 100);
            rect(WIDTH / 2, (HEIGHT / 2) + 50, WIDTH / 2 + 20, 410);
            rect(WIDTH / 2, (HEIGHT / 2) + 50, WIDTH / 2 + 10, 400); */
            image(textures.win, WIDTH / 2, HEIGHT / 2);
            textSize(128);
            stroke(0);
            strokeWeight(0);
            fill(255);
            let last = this.levelNumber >= levels.length - 1;
            let t = "NICE!";
            text(t, (WIDTH / 2), HEIGHT / 2 - 50);
            textSize(46);
            strokeWeight(0);
            t = Math.round(this.levelTime / 1000);
            let m = Math.round(t / 60);
            let s = ('0' + (t % 60)).slice(-2);
            text(`${m}m ${s}s`, (WIDTH / 2), HEIGHT / 2);
            fill(51);
            t = "Completion Bonus +1000";
            this.drawHighlightedText(t, {
                x: (WIDTH / 2),
                y: HEIGHT / 2 + 50
            }, 28);
            let hasTimeBonus = this.levelTime < 30000;
            let timeBonus = 0;
            if (hasTimeBonus) {
                if (this.levelTime < 10000) timeBonus = 500;
                else timeBonus = 100;
            }
            t = "Time Bonus +" + timeBonus;
            this.drawHighlightedText(t, {
                x: (WIDTH / 2),
                y: HEIGHT / 2 + 100
            }, 28);
            t = "Coins Missed: " + game.level.coin_count;
            push();
            let highlight_color = game.level.coin_count == 0 ? color(225, 255, 225) : color(255, 255, 255, 100);
            fill(game.level.coin_count == 0 ? color(0, 200, 0) : color(51));
            this.drawHighlightedText(t, {
                x: (WIDTH / 2),
                y: HEIGHT / 2 + 137.5
            }, 28, highlight_color);
            image(textures.coin, WIDTH / 2 - textWidth(t) / 2, HEIGHT / 2 + 128.5, 28, 28)
            if (game.level.coin_count == 0) {
                t = "Coin Collector Bonus: +200";
                this.drawHighlightedText(t, {
                    x: (WIDTH / 2),
                    y: HEIGHT / 2 + 175
                }, 28, highlight_color);
            }
            pop();
            this.resetTimeout -= deltaTime;
            if (this.resetTimeout <= 0) {
                if (!last) {
                    if (hasTimeBonus) {
                        this.player.score += timeBonus;
                    }
                    if (this.level.coin_count == 0) {
                        this.player.score += 200;
                    }
                    this.nextLevel();
                } else {
                    this.gameOver = true;
                    this.youWin();
                }
            }
        }

        if (this.levelSelectionMode) this.levelManager.renderPreviews();

        this.firstFrame = false;

        if (this.player.dead) {
            if (this.resetTimeout < this.defaultResetTimeout * 0.6) {
                fill(0, 50);
                rect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
                image(textures.win, WIDTH / 2, HEIGHT / 2);
                textSize(200 + (sin(millis() / 500) * 20));
                stroke(0);
                strokeWeight(0);
                fill(200, 100, 100);
                let t = ";-;";
                text(t, (WIDTH / 2), HEIGHT / 2);
            }
            this.resetTimeout -= deltaTime * 3;
            if (this.resetTimeout <= 0) {
                this.startTime = this.levelTime;
                this.reset();
                this.runner.enabled = true;
            }
        }
    }

    drawHighlightedText(string, position, size, highlight = color(255, 255, 255, 100)) {
        push();
        textSize(size);
        stroke(51);
        let height = size + 8;
        let width = 390; //Math.min(textWidth(string) + 30, 390);
        translate(position.x, position.y);
        image(textures.highlight, 0, (-height / 2) + 10);
        //push();
        //noStroke();
        //fill(highlight);
        //rect(0, (-height / 2) + 10, width, height);
        //pop();
        //fill(255);
        text(string, 0, 0);
        pop();
    }
}