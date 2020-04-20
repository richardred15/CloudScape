class Explosion {
    constructor(x, y, c = "rgb(255,200,0)", sparkCount = 100, speedMultiplier = 0.5) {
        this.position = {
            x: x,
            y: y
        }
        this.dead = false;
        if (typeof c == "string") c = color(c);

        this.sparks = [];
        for (let i = 0; i < sparkCount; i++) {
            let speed = Math.random() * speedMultiplier;
            let col = color(c.levels[0], c.levels[1], c.levels[2]);
            let sat = (Math.random() * -0.5) + 1.5;
            col.setRed(c.levels[0] * sat);
            col.setGreen(c.levels[1] * sat);
            col.setBlue(c.levels[2] * sat);
            this.sparks.push({
                x: x,
                y: y,
                velocity: {
                    x: sin(i) * speed,
                    y: cos(i) * speed
                },
                life: 1,
                radius: Math.floor(Math.random() * 20),
                color: col
            });
        }
    }

    update() {
        for (let s = this.sparks.length - 1; s >= 0; s--) {
            let spark = this.sparks[s];
            spark.x += spark.velocity.x * (deltaTime / 3);
            spark.y += spark.velocity.y * (deltaTime / 3);
            if (spark.velocity.y < 0.1) spark.velocity.y += (deltaTime / 2000);
            spark.life -= (deltaTime / 800);
            spark.color.setAlpha(spark.life * 255);
            if (spark.life <= 0) {
                this.sparks.splice(s, 1);
            }
        }
        if (this.sparks.length == 0) {
            this.dead = true;
        }
    }

    render() {
        if (this.dead) return;
        this.update();
        noStroke();
        for (let spark of this.sparks) {
            fill(spark.color);
            ellipse(spark.x, spark.y, spark.radius);
        }
    }
}