class LevelManager {
    constructor(game) {
        this.custom_level_names = [];
        this.custom_levels = {};
        this.renderings = {};
        this.selected_levels = {};
        this.game = game;
        this.set_cursor = false;
        this.cursor_set = false;
        this.levels = [{
            obstacles: [],
            coins: [],
            boosts: []
        }];
        this.default_levels = this.levels;

        this.loadMyLevels();
        this.init();
    }

    init() {
        this.levels = [];
        for (let level of LevelManager.level_names) {
            this.levels.push(level_cache[level]);
        }
        this.default_levels = this.levels;
    }

    renderPreviews() {
        fill("rgba(0, 0, 0, 0.4)");
        rect(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
        /* fill(255);
        rect(WIDTH / 2, HEIGHT / 2, 400, 300); */
        image(textures.win, WIDTH / 2, HEIGHT / 2, 420, 320);
        let hovered = -1;
        let mx = mouseX; // - ((window.innerWidth - WIDTH) / 2);
        let my = mouseY; // - ((window.innerHeight - HEIGHT) / 2);
        if (mx < 600 && mx > 200 && my < 600 && my > 150) {
            mx = Math.floor((mx - 200) / 100);
            my = Math.floor((my - 150) / 100);
            hovered = my * 4 + mx;
        }
        this.set_cursor = false;
        let x = WIDTH / 2 - 150;
        let y = HEIGHT / 2 - 110;
        let i = 0;
        for (let rendering in this.renderings) {
            fill(51);
            if (hovered == i) {
                stroke(0);
                strokeWeight(1);
                fill(255);
                cursor(HAND);
                this.set_cursor = true;
                this.cursor_set = true;
            }
            rect(x, y + 10, 90, 90);
            noStroke();
            image(this.renderings[rendering], x, y);
            fill(255);
            if (hovered == i) fill(0);
            text(rendering, x, y + 45);
            x += 100;
            if (x > 560) {
                y += 100;
                x = WIDTH / 2 - 150;
            }
            i++;
        }
        if (!this.set_cursor && this.cursor_set) {
            cursor(ARROW);
            this.cursor_set = false;
        }
        if (i == 0) {
            fill(0);
            textSize(16);
            text("Levels you create in the Level Editor will show up here!", WIDTH / 2, HEIGHT / 2);
        }
    }

    selectMyLevel(name) {
        this.game.levelSelectionMode = false;
        levels = [this.custom_levels[name]];
        this.game.levelNumber = 0; //levels.length - 1;
        this.game.reset();
        this.game.start();
    }

    loadMyLevels() {
        this.custom_level_names = JSON.parse(localStorage.getItem("my_levels"));
        if (this.custom_level_names == null) this.custom_level_names = [];
        else {
            for (let name of this.custom_level_names) {
                this.custom_levels[name] = this.getMyLevel(name);
                this.renderings[name] = LevelManager.renderPreview(this.custom_levels[name]);
            }
        }
    }

    getMyLevel(name) {
        let level = {
            scenes: [{
                layers: [{
                    obstacles: [],
                    goal: {},
                    coins: [],
                    boosts: [],
                    spikes: [],
                    angel_coins: [],
                    balloons: []
                }]
            }]
        }

        let data = localStorage.getItem("level_" + name);
        if (data != null) {
            data = JSON.parse(data);
            for (let prop in data) {
                if (!level.hasOwnProperty(prop)) continue;
                level[prop] = data[prop];
            }
            return level;
        }
        return false;
    }

    static renderPreview(level) {
        let preview = createGraphics(80, 60);
        preview.rectMode(CENTER);
        preview.ellipseMode(CENTER);
        //preview.background(0);
        preview.background(135, 206, 235);
        preview.scale(0.1, 0.1);
        preview.fill(255);
        for (let obs of level.scenes[0].layers[0].obstacles) {
            preview.push();
            if (obs[4] != 0) console.log(obs[4]);
            preview.translate(obs[0], obs[1]);
            preview.rotate(obs[4]);
            preview.rect(0, 0, obs[2], obs[3]);
            preview.pop();
        }
        preview.fill(255);
        for (let spikes of level.scenes[0].layers[0].spikes) {
            preview.push();
            preview.translate(spikes[0], spikes[1]);
            preview.rotate(spikes[4]);
            preview.beginShape();
            preview.vertex(-100, spikes[3] / 2);
            preview.vertex(-80, -spikes[3] / 2);
            preview.vertex(-60, spikes[3] / 2);
            preview.vertex(-40, -spikes[3] / 2);
            preview.vertex(-20, spikes[3] / 2);
            preview.vertex(-0, -spikes[3] / 2);
            preview.vertex(20, spikes[3] / 2);
            preview.vertex(40, -spikes[3] / 2);
            preview.vertex(60, spikes[3] / 2);
            preview.vertex(80, -spikes[3] / 2);
            preview.vertex(100, spikes[3] / 2);
            preview.endShape(CLOSE);
            //preview.rect(obs[0] - (obs[2] / 2), obs[1] - (obs[3] / 2), obs[2], obs[3]);
            preview.pop();
        }
        preview.fill(255, 255, 0);
        for (let coin of level.scenes[0].layers[0].coins) {
            preview.push();
            preview.rotate(coin[4]);
            preview.ellipse(coin[0], coin[1], coin[2], coin[3]);
            preview.pop();
        }
        preview.fill(255, 255, 255);
        for (let angel_coin of level.scenes[0].layers[0].angel_coins) {
            preview.push();
            preview.rotate(angel_coin[4]);
            preview.ellipse(angel_coin[0], angel_coin[1], angel_coin[2], angel_coin[3]);
            preview.pop();
        }
        preview.fill(255, 255, 0);
        for (let balloon of level.scenes[0].layers[0].balloons) {
            preview.push();
            preview.rotate(balloon[4]);
            preview.ellipse(balloon[0], balloon[1], balloon[2], balloon[2]);
            preview.stroke(255);
            preview.strokeWeight(5);
            preview.line(balloon[0], balloon[1], balloon[0], balloon[1] + (balloon[3] - (balloon[2] / 2)));
            preview.pop();
        }
        preview.fill(255, 0, 0);
        for (let boost of level.scenes[0].layers[0].boosts) {
            preview.push();
            preview.rotate(boost[4]);
            preview.ellipse(boost[0], boost[1], boost[2], boost[3]);
            preview.pop();
        }
        return preview;
    }
}

LevelManager.level_names = ["one", "two", "three", "four"];