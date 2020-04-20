class Cup {
    constructor(world) {
        this.world = world;
        let svg = "M 0 0 L30 -0 L30 80 L90 80 L90 0 L120 0 L120 100 L0 100 Z";
        let path = svg.replace(/[A-z]/g, "");
        this.vertices = Matter.Vertices.fromPath(path);
        for (let v of this.vertices) {
            v.x *= 1;
            v.y *= 1;
        }
        console.log(this.vertices);
        this.position = {
            x: WIDTH * 0.85,
            y: max(HEIGHT * 0.3, 300)
        }
        this.body = Matter.Bodies.fromVertices(this.position.x, this.position.y, [this.vertices], {
            isStatic: true,
            label: "floor"
        });
        this.goal = new Rectangle(world, this.body.position.x, this.body.position.y + 16, 25, 10, {
            label: "goal",
            isStatic: true
        });
        this.roof_position = {
            x: this.position.x,
            y: -200
        }
        this.leaving = false;
        this.rain = new Rain(this.position.x, this.position.y + 150, 80, 0.1, 0.5, color(225, 200, 100));
        this.scored = false;
        this.goal.body.goal = this;
        this.goal.color = color("#ffffff");
        console.log(this.body);
        Matter.World.add(world, this.body);
        this.glow = textures.glow;
        this.glow_scored = textures.glow_scored;
        this.star = textures.star;
        this.evading = false;
        this.evasionCount = 0;
    }

    evade() {
        if (!this.evading) {
            //this.evading = true;
        } else {
            this.evasionCount = 0;
            this.body.position.x = this.position.x;
        }
        this.evading = !this.evading;
    }

    reset() {
        this.body.position.x = WIDTH * 0.85;
        this.body.position.y = max(HEIGHT * 0.3, 300);
        this.goal.position.x = this.body.position.x;
        this.goal.position.y = this.body.position.y + 16;
        this.scored = false;
        this.leaving = false;
    }

    update() {
        this.position = this.body.position;
        if (this.evading) {
            let amt = sin(this.evasionCount / 100) * 50;
            this.body.position.x = this.position.x + amt;
            console.log(sin(this.evasionCount / 50) * 50);
            this.evasionCount++;
        }
        this.rain.setYPosition(this.position.y + 30);
        this.rain.update();
    }

    render() {
        this.update();
        this.rain.render();
        noStroke();
        if (this.scored) {
            if (this.roof_position.y < 200 && !this.leaving) {
                this.roof_position.y += deltaTime;
            } else if (this.body.position.y > -200) {
                this.leaving = true;
                this.body.position.y -= deltaTime;
                this.goal.position.y -= deltaTime;
                this.roof_position.y -= deltaTime;
                game.player.body.position.y -= deltaTime;
            }
        }
        image(textures.roof, this.roof_position.x, this.roof_position.y);
        push();
        translate(this.body.position.x, this.body.position.y - 15);
        image(this.scored ? this.glow_scored : this.glow, 0, 0);
        image(textures.cup, 0, 0);
        pop();

        //this.goal.render();
    }
}