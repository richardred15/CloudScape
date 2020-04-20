class ParticleTrail {


    constructor(x, y, options = {}) {
        this.game = game;
        this.start_x = x;
        this.start_y = y;

        this.position = {
            x: x,
            y: y
        }
        this.options = {
            color: color(50, 150, 255),
            speed_multiplier: 1,
            particle_lifetime: 300,
            base_alpha: 100,
            invert_gravity: false,
            gravity: 1,
            spawn_radius: 5,
            particle_density: 15,
            max_radius: 30
        }
        Object.assign(this.options, options);
        this.set_color = this.options.color;

        this.particles = [];
        this.even = rand() < 0.5;
    }


    setColor(color) {
        this.set_color = color;
    }

    reset() {
        this.particles = [];
    }

    update(x = this.position.x, y = this.position.y, create_particle = true) {
        if (!GameSettings.particles_enabled) return;
        this.position = {
            x: x,
            y: y
        }
        if (create_particle) {
            if (this.options.particle_density >= 1) {
                for (let i = 0; i < this.options.particle_density; i++) {
                    this.newParticle();
                }
            } else {
                if (frameCount % Math.floor(1 / Math.min(1, (rand() / 3) + this.options.particle_density)) == 0) {
                    this.newParticle();
                }
            }
        }
        for (let p = this.particles.length - 1; p >= 0; p--) {
            let particle = this.particles[p];
            particle.update(deltaTime);
            if (particle.dead) {
                this.particles.splice(p, 1);
                ParticleTrail.particle_count--;
            }
        }
        this.options.color = lerpColor(this.options.color, this.set_color, deltaTime / 1000);
    }

    newParticle() {
        if (GameSettings.particles_reduced) {
            if (frameCount % 2 == this.even ? 0 : 1) return;
        }
        let col = color(this.options.color.levels);
        if (theme == DARK) {
            col.setRed(this.options.color.levels[0] - 10);
            col.setGreen(this.options.color.levels[1] - 10);
            col.setBlue(this.options.color.levels[2] - 10);
        }
        let x = this.position.x + ((rand() < 0.5 ? -1 : 1) * (rand() * this.options.spawn_radius));
        let y = this.position.y + ((rand() < 0.5 ? -1 : 1) * (rand() * this.options.spawn_radius));
        let particle = new Particle(x, y, col, this.options.speed_multiplier, this.options.particle_lifetime, this.options.base_alpha, this.options.max_radius);
        particle.gravity_strength = this.options.gravity;
        particle.invert_gravity = this.options.invert_gravity;
        this.particles.push(particle);
        ParticleTrail.particle_count++;
    }

    render() {
        if (!GameSettings.particles_enabled) return;
        for (let particle of this.particles) {
            particle.render();
        }
        ParticleTrail.existing_trails++;
    }
}

ParticleTrail.particle_count = 0;
ParticleTrail.existing_trails = 0;

class Particle {
    constructor(x, y, color, speedMultiplier = 1, lifetime, alpha, max_radius) {
        this.position = {
            x: x,
            y: y
        }
        this.base_alpha = alpha;
        this.color = color;
        this.dead = false;
        this.invert_gravity = false;
        this.gravity_strength = 1;
        this.age = 0;
        this.radius = rand() * max_radius;
        this.lifetime = (rand() * lifetime) + lifetime;
        this.speed = (rand() / 3) * speedMultiplier;
        this.velocity = {
            x: (rand() < 0.5 ? -1 : 1) * rand() * this.speed,
            y: (rand() < 0.5 ? -1 : 1) * rand() * this.speed
        }
    }

    update(deltaTime) {
        this.position.x += this.velocity.x * (deltaTime / 3);
        this.position.y += this.velocity.y * (deltaTime / 3);
        if (this.invert_gravity) {
            if (this.velocity.y < 0.75) this.velocity.y += (deltaTime / 1000) * this.gravity_strength;
        } else {
            if (this.velocity.y > 0.75) this.velocity.y -= (deltaTime / 1000) * this.gravity_strength;
        }
        this.age += deltaTime;
        if (this.age > this.lifetime) this.dead = true;
    }

    render() {
        noStroke();
        this.color.setAlpha(this.base_alpha * (1 - (this.age / this.lifetime)));
        fill(this.color);
        //fill(0);
        ellipse(this.position.x, this.position.y, this.radius, this.radius);
        ParticleTrail.particle_count++;
    }
}