class Rain {


    constructor(x, y, width, spawner_density = 0.1, particle_density = 0.01, _color = color(200, 200, 255, 50), angle) {
        this.spawner_density = spawner_density;
        this.distance = 1 / this.spawner_density;
        this.particle_lifetime = 1000;
        this.particle_density = particle_density;
        this.position = {
            x: x,
            y: y
        }
        this.width = width;
        this.count = Math.floor(this.width / this.distance);
        console.log(this.count, this.width, this.distance);
        this.spawners = [];
        this.color = _color;
        this.color.setAlpha(50);
        for (let i = 0; i < this.count; i++) {
            let options = {
                gravity: Math.random() / 10,
                invert_gravity: true,
                particle_density: this.particle_density,
                speed_multiplier: 0.05,
                max_radius: 7,
                particle_lifetime: this.particle_lifetime,
                base_alpha: 255,
                color: this.color
            }
            let trail = new ParticleTrail(((x - (width / 2)) + (i * this.distance)) + this.distance / 2, y, options);

            trail.setColor(this.color);
            this.spawners.push(trail);
        }
        Rain.counts.push(this.count);
        Rain.instances++;
    }



    setYPosition(y) {
        this.position.y = y;
        for (let spawner of this.spawners) {
            spawner.position.y = y;
        }
    }

    update() {
        for (let spawner of this.spawners) {
            spawner.update();
        }
    }

    render() {
        for (let spawner of this.spawners) {
            spawner.render();
        }
    }
}

Rain.instances = 0;
Rain.counts = [];