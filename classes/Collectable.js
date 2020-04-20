class Collectable {
    constructor(world, x, y, angle = 0, width = 40, height = 40) {
        this.world = world;
        this.width = width;
        this.height = height;
        this.radius = this.width;
        this.rectangle = width != height;
        this.angle = angle;
        this.position = {
            x: x,
            y: y
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.removed = false;
        this.removeOnCollect = true;
        this.particleColor = YELLOW;
        this.showParticles = true;
        this.color = YELLOW;
        this.texture = textures.coin;
        this.collected_texture = this.texture;
        this.label = "collectable";
        this.value = 100;
        this.collected = false;
        this.sound = soundManager.sounds.collect;
        this.idle_particles = this.showParticles;
    }

    init() {
        this.options = {
            isStatic: true,
            label: this.label,
            isSensor: true,
            angle: this.angle
        };
        if (!this.rectangle) {
            this.body = Matter.Bodies.circle(this.position.x, this.position.y, Math.min(this.width, this.height) / 2, this.options);
        } else {
            this.body = Matter.Bodies.rectangle(this.position.x, this.position.y, this.width, this.height, this.options);
        }
        this.body.collectable = this;
        Matter.World.add(this.world, this.body);
        if (!this.showParticles) this.idle_particles = false;
        if (this.idle_particles) {
            let options = {
                particle_density: 0.5,
                speed_multiplier: 0.2,
                max_radius: 5,
                particle_lifetime: 1000,
                base_alpha: 255,
                gravity: 0.3,
                spawn_radius: 15,
                invert_gravity: true,
                color: this.particleColor
            }
            this.particle_trail = new ParticleTrail(this.position.x, this.position.y, options);

            this.particle_trail.setColor(this.particleColor);
        }
    }

    collect() {
        this.collected = true;
        console.log(this.label + " collected");
        if (this.showParticles) {
            game.newExplosion(this.body.position.x, this.body.position.y, this.particleColor, 25, 0.4);
            soundManager.sounds.fizzle.play();

        }
        this.sound.play();
        if (this.removeOnCollect) this.remove();
    }

    remove() {
        Matter.World.remove(this.world, this.body);
        this.removed = true;
    }

    setVelocity(velocity) {
        Matter.Body.setVelocity(this.body, velocity);
    }

    addVelocity(velocity) {
        Matter.Body.setVelocity(this.body, {
            x: this.body.velocity.x + velocity.x,
            y: this.body.velocity.y + velocity.y
        });
    }

    update() {
        this.position = this.body.position;
        this.angle = this.body.angle;
        this.velocity = this.body.velocity;
        if (this.showParticles && this.idle_particles) {
            this.particle_trail.update();
        }
    }

    render() {
        if (this.removed) return false;
        this.update();
        if (this.showParticles && this.idle_particles) {
            this.particle_trail.render();
        }
        push();
        //fill(this.color);
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        image(this.collected ? this.collected_texture : this.texture, 0, 0, this.width, this.height);
        pop();
        return true;
    }
}