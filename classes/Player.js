class Player {
    constructor(world, engine, game) {
        this.world = world;
        this.setup();
        let p = this;
        Matter.Events.on(engine, "collisionStart", function (e) {
            p.collision(e);
        });
        this.overlay = textures.overlay;
        this.jumping = false;
        this.moveAccel = 0.02;
        this.lastDirection = undefined;
        this.color = color("#003cff"); //color(random(20, 200), random(20, 200), random(20, 200));
        this.score = 0;
        this.level_score = 0;
        this.game = game;
        this.jumpBoost = 0;
        this.maxBoost = -10;
        this.dead = false;
        this.deaths = 0;
        this.floating = 0;
        this.lightweight = 0;
        this.extraLightWeight = false;
        this.woosh = {
            right: true,
            left: true
        }
        this.particle_trail = new ParticleTrail(200, 200, {
            particle_density: 4,
            color: color(255, 200, 0)
        });
        this.textures = {
            body: {
                left: textures.player.body_left,
                default: textures.player.body,
                right: textures.player.body_right
            },
            head: {
                left: textures.player.head_left,
                default: textures.player.head,
                right: textures.player.head_right
            }
        }
    }

    setup() {
        this.body = new Circle(this.world, 200, 200, 25, {
            isStatic: false,
            label: "player",
            mass: 100,
            density: 0.05,
            intertia: 0,
            friction: 0.5,
            restitution: 0
        });

        this.missedCoins = 0;
        this.missedBoosts = 0;
    }

    collision(e) {
        let playerHit = ["balloon", "ceiling", "obstacle", "wall", "floor", "coin", "boost", "spikes", "angel_coin"];
        let ignore = ["balloon", "ceiling", "coin", "boost", "angel_coin"];
        for (let pair of e.pairs) {
            let hit = false;
            let p;
            let o;
            if (playerHit.includes(pair.bodyA.label)) {
                hit = true;
                p = pair.bodyB;
                o = pair.bodyA;
            }
            if (playerHit.includes(pair.bodyB.label)) {
                hit = true;
                p = pair.bodyA;
                o = pair.bodyB;
            }
            if (hit) {
                if (p.label == "player") {
                    if (!ignore.includes(o.label)) {
                        this.jumping = false;
                    }
                    if (bounceCountdown == 0 && !o.isSensor) {
                        soundManager.sounds.bounce.play();
                        bounceCountdown = 100;
                    }
                    if (o.label == "coin") {
                        this.score += o.collectable.value;
                        this.level_score += o.collectable.value;
                        this.particle_trail.options.color = color(255, 255, 0);
                        o.collectable.collect();
                    }
                    if (o.label == "boost") {
                        this.jumpBoost = this.maxBoost;
                        this.particle_trail.options.color = RED;
                        console.log("boost");
                        o.collectable.collect();
                    }
                    if (o.label == "spikes") {
                        this.dead = true;
                        this.deaths++;
                        this.game.paused = true;
                        this.game.runner.enabled = false;
                        this.game.newExplosion(this.body.position.x, this.body.position.y, o.collectable.particleColor);
                        this.score -= this.level_score;
                        this.level_score = 0;
                        o.collectable.collect();
                    }
                    if (o.label == "angel_coin") {
                        //this.jumpBoost = this.maxBoost;
                        this.floating = 2000;
                        console.log("angel_coin");
                        o.collectable.collect();
                    }
                    if (o.label == "balloon") {
                        //this.jumpBoost = this.maxBoost;
                        if (this.lightweight > 0 && !this.extraLightWeight) this.extraLightWeight = true;
                        else this.lightweight = 2000;
                        console.log("balloon");
                        o.collectable.collect();
                    }
                }
            }
            if (pair.bodyA.label == "goal" || pair.bodyB.label == "goal") {
                let body = pair.bodyA.label == "goal" ? pair.bodyB : pair.bodyA;
                let goal = pair.bodyA.label == "player" ? pair.bodyB : pair.bodyA;
                if (body.label == "player") {
                    console.log("GOAL");
                    this.score += 1000;
                    soundManager.sounds.success.play();
                    goal.goal.scored = true;
                    this.game.runner.enabled = false;
                    this.game.paused = true;
                    this.game.firstFrame = true;
                    this.game.win = true;
                    game.newExplosion(this.body.position.x, this.body.position.y, this.particle_trail.options.color, 25, 0.4);
                }
            }
        }
    }

    reset() {
        this.lightweight = 0;
        this.floating = 0;
        this.level_score = 0;
        this.extraLightWeight = false;
        this.dead = false;
        this.body.remove();
        this.particle_trail.reset();
        this.setup();
    }

    move(direction) {
        if (direction != this.lastDirection) {
            this.moveAccel = 0.02;
        }
        switch (direction) {
            case LEFT:
                this.body.body.angle -= 0.0003 * deltaTime * this.moveAccel;
                this.body.setVelocity({
                    x: -1.5 * deltaTime * this.moveAccel,
                    y: this.body.velocity.y
                });
                if (this.woosh.left) {
                    this.woosh.left = false;
                    soundManager.sounds.woosh.play();
                }
                break;
            case RIGHT:
                this.body.body.angle += 0.0003 * deltaTime * this.moveAccel;
                this.body.setVelocity({
                    x: 1.5 * deltaTime * this.moveAccel,
                    y: this.body.velocity.y
                });
                if (this.woosh.right) {
                    this.woosh.right = false;
                    soundManager.sounds.woosh.play();
                }
                break;
            default:
                break;
        }
        if (this.moveAccel < 1) this.moveAccel += 0.02;
        this.lastDirection = direction;
    }

    jump(useBoost = false) {
        if (!this.jumping) {
            this.body.addVelocity({
                x: 0,
                y: -10 + (useBoost ? this.jumpBoost : 0)
            });
            if (useBoost) {
                this.jumpBoost = 0;
                this.particle_trail.options.color = color(0, 200, 0);
                soundManager.sounds.woosh_high.play();
            }
            soundManager.sounds.jump.play();
            this.jumping = true;
        }
    }

    update() {
        this.body.update();
        if (bounceCountdown > 0) bounceCountdown -= deltaTime;
        if (bounceCountdown < 0) bounceCountdown = 0;
        if (!this.jumping && this.jumpBoost > this.maxBoost) {
            let percentage = this.jumpBoost / this.maxBoost;
            this.jumpBoost -= 0.05 - ((percentage) * 0.04);
        }
        if (this.lightweight > 0) {
            let newWeight = this.extraLightWeight ? 0.1 : 0.8;
            let curVY = this.body.body.velocity.y;
            if (curVY > newWeight) {
                this.body.setVelocity({
                    x: this.body.body.velocity.x,
                    y: newWeight
                });
            }
            this.lightweight -= deltaTime;
            if (this.lightweight < 0) this.lightweight = 0;
        }
        if (this.floating > 0) {
            let newWeight = -0.5
            let curVY = this.body.body.velocity.y;
            if (curVY > newWeight) {
                this.body.setVelocity({
                    x: this.body.body.velocity.x,
                    y: newWeight
                });
            }
            this.floating -= deltaTime;
            if (this.floating < 0) this.floating = 0;
        }
        //console.log(this.body.velocity);
        if (Math.abs(this.body.velocity.x) < 0.05) this.body.velocity.x = 0;
    }

    render() {
        if (GameSettings.particles_enabled) {
            this.particle_trail.update(this.body.position.x, this.body.position.y, !this.dead);
            this.particle_trail.render(deltaTime);
        }
        if (this.dead) return;
        noStroke();
        //fill("#ff2a00");
        //this.body.render();
        push();
        translate(this.body.position.x, this.body.position.y);
        //push();
        //rotate(this.body.angle);
        if (this.floating) {
            image(textures.wings, 0, -10, 75, 27);
        }
        let head_image = this.textures.head.default;
        let body_image = this.textures.body.default;
        if (this.body.velocity.x > 0) {
            body_image = this.textures.body.right;
            head_image = this.textures.head.right;
        } else if (this.body.velocity.x < 0) {
            body_image = this.textures.body.left;
            head_image = this.textures.head.left;
        }
        image(body_image, 0, 12);
        image(head_image, 0, -11);
        //pop();
        //push();
        //fill(this.color);

        //
        //rect(0, 0, 25, 25);
        //rotate(Math.PI / 4);
        //rect(0, 0, 25, 25);
        //pop();
        /* push();
        rotate(Matter.Vector.angle({
            x: WIDTH / 2,
            y: 0
        }, this.body.position));
        rotate(-Math.PI / 2);
        image(this.overlay, 0, 0);
        pop(); */
        pop();
    }
}