class Level {
    constructor(data) {
        this.scenes = [];
        for (let scene of data.scenes) {
            this.scenes.push(new Scene(scene));
        }
        this.current_scene = 0;
        this.coin_count = 0;
    }

    render() {
        this.scenes[this.current_scene].render();
        this.coin_count = this.scenes[this.current_scene].coin_count;
    }
}

class Scene {
    constructor(scene) {
        this.layers = [];
        for (let layer of scene.layers) {
            this.layers.push(new Layer(layer));
        }
        this.coin_count = 0;
    }

    render() {
        this.coin_count = 0;
        for (let layer of this.layers) {
            layer.render();
            this.coin_count += layer.coin_count;
        }
    }
}

class Layer {
    constructor(data) {
        this.data = {};
        this.data.obstacles = data.obstacles || [];
        this.data.goal = data.goal || {};
        this.data.coins = data.coins || [];
        this.data.boosts = data.boosts || [];
        this.data.spikes = data.spikes || [];
        this.data.angel_coins = data.angel_coins || [];
        this.data.balloons = data.balloons || [];
        this.coin_count = 0;
        this.total_coins = 0;
        this.init();
    }

    render() {
        for (let obstacle of this.obstacles) {
            obstacle.update();
            push();
            translate(obstacle.position.x, obstacle.position.y);
            rotate(obstacle.angle);
            image(textures.obstacle, 0, 0, obstacle.width, obstacle.height);
            pop();
            //obstacle.render();
        }
        this.coin_count = 0;
        for (let coin of this.coins) {
            //coin.update();
            if (!coin.removed) this.coin_count++;
            coin.render();
        }
        this.boostCount = 0;
        for (let boost of this.boosts) {
            //boost.update();
            if (!boost.removed) this.boostCount++;
            boost.render();
        }
        for (let spikes of this.spikes) {
            spikes.render();
        }
        for (let angel_coin of this.angel_coins) {
            angel_coin.render();
        }
        for (let balloon of this.balloons) {
            balloon.render();
        }
    }

    init() {
        this.obstacles = [];
        this.goal = {};
        this.coins = [];
        this.boosts = [];
        this.spikes = [];
        this.angel_coins = [];
        this.balloons = [];
        for (let prop in this.data) {
            if (!this.hasOwnProperty(prop)) continue;
            let items = this.data[prop];
            switch (prop) {
                case "obstacles":
                    for (let obstacle of items) {
                        let rect = new Rectangle(Game.world, obstacle[0], obstacle[1], obstacle[2], obstacle[3], {
                            angle: obstacle[4],
                            isStatic: true,
                            friction: 100,
                            label: "obstacle"
                        });
                        rect.raining = true;
                        this[prop].push(rect);
                    }
                    break;
                case "coins":
                    for (let coin of items) {
                        this[prop].push(new Coin(Game.world, coin[0], coin[1]));
                        this.count_count++;
                    }
                    this.total_coins = this.count_count;
                    break;
                case "boosts":
                    for (let boost of items) {
                        this[prop].push(new MaxBoost(Game.world, boost[0], boost[1]));
                        this.boostCount++;
                    }
                    this.boostsInLevel = this.boostCount;
                    break;
                case "spikes":
                    for (let spikes of items) {
                        this[prop].push(new Spikes(Game.world, spikes[0], spikes[1], spikes[4]));
                    }
                    break;
                case "angel_coins":
                    for (let angel_coin of items) {
                        this[prop].push(new AngelCoin(Game.world, angel_coin[0], angel_coin[1], angel_coin[4]));
                    }
                    break;
                case "balloons":
                    for (let balloon of items) {
                        this[prop].push(new Balloon(Game.world, balloon[0], balloon[1], balloon[4]));
                    }
                    break;
                default:
                    break;
            }
        }
    }
}