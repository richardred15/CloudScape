class HUD {
    constructor(game) {
        this.game = game;

        this.boostCache = game.player.jumpBoost;
        this.deathColor = color(41);
        this.deathCache = 0;
        this.score_cache = 0;
        this.new_score = 0;
        this.score_deltas = [];
        let options = {
            particle_density: 5,
            max_radius: 4,
            particle_lifetime: 400,
            speed_multiplier: 0.2,
            gravity: 0
        }
        this.boost_particles = new ParticleTrail(370, 190, options);
        this.boost_particles.setColor(GREEN);

    }

    render() {
        push();
        translate(WIDTH / 2, HEIGHT / 2);
        scale(userScale, userScale);
        image(textures.hud, 0, 0);
        noStroke();
        textSize(96);
        fill(255);
        let t = (this.game.levelNumber + 1).toString();
        text(t, 335, -220);
        textSize(36);
        this.deathColor = lerpColor(this.deathColor, color(41), deltaTime / 200);
        fill(this.deathColor);
        ellipse(237, -289, 55, 55);
        fill(255);
        if (this.game.player.deaths != this.deathCache) {
            if (this.game.player.deaths > this.deathCache) {
                this.deathColor = color(255, 0, 0);
            }
            this.deathCache = this.game.player.deaths;
        }
        t = this.game.player.deaths;
        text(`${t}`, 235, -270);
        if (this.new_score != this.game.player.score) {
            this.score_deltas.push({
                delta: this.game.player.score - this.new_score,
                lifetime: 3000
            });
            this.new_score = this.game.player.score;
        }
        if (this.score_cache != this.game.player.score) {
            this.score_cache = lerp(this.score_cache, this.game.player.score, deltaTime / 200);
            if (Math.abs(this.score_cache - this.game.player.score) < 0.05) this.score_cache = this.game.player.score;
        }
        t = Math.round(this.score_cache);
        text(`${t}`, 0, -268);
        t = ((this.game.levelTime / 1000).toFixed(3) + "0000").slice(0, 5);
        text(`${t}`, -330, -268);

        this.boost_particles.render();
        if (this.boostCache != this.game.player.jumpBoost) {
            this.boostCache = lerp(this.boostCache, this.game.player.jumpBoost, 0.05);
            if (Math.abs(this.boostCache - this.game.player.jumpBoost) < 0.1) this.boostCache = this.game.player.jumpBoost;
        }
        let barHeight = (this.boostCache / this.game.player.maxBoost);
        //if (barHeight > 0.95) fill(255, 255, 0);
        let y = barHeight * 55;
        barHeight = 10 + (110 * barHeight);
        this.boost_particles.update(370, (245 - y) - (barHeight / 2));
        image(textures.bar, 370, 245 - y, 18, barHeight);
        textSize(25);
        stroke(0);
        strokeWeight(1);
        push();
        fill(255);
        textAlign(LEFT);
        image(textures.coin, -WIDTH / 2 + 15, -HEIGHT / 2 + 65, 25, 25);
        text("Coins Remaining: " + game.level.coin_count, -WIDTH / 2 + 30, -HEIGHT / 2 + 75);
        pop();
        for (let i = this.score_deltas.length - 1; i >= 0; i--) {
            let deltaInfo = this.score_deltas[i];
            let alpha = 255;
            let delta = deltaInfo.delta;
            if (deltaInfo.lifetime < 300) {
                alpha = (deltaInfo.lifetime * 0.85);
            }
            let young = [color(0, 200, 0, alpha), color(200, 0, 0, alpha)]
            let old = color(255, 255, 255, alpha);
            let c = delta < 0 ? young[1] : young[0];
            if (deltaInfo.lifetime < 1500) {
                if (delta < 0)
                    c = lerpColor(old, young[1], deltaInfo.lifetime / 1500);
                else
                    c = lerpColor(old, young[0], deltaInfo.lifetime / 1500);
            }
            fill(c);
            stroke(0, alpha);
            let y = (i * 40) + 80;
            let str = (delta >= 0 ? "+ " : "");
            let d = delta.toString().split("");
            for (let c of d) {
                str += c + " ";
            }
            text(str, 0, -HEIGHT / 2 + y);
            this.score_deltas[i].lifetime -= deltaTime;
            if (deltaInfo.lifetime <= 0) {
                this.score_deltas.splice(i, 1);
            }
        }

        pop();
    }
}