class Spikes extends Collectable {
    constructor(world, x, y, angle) {
        super(world, x, y, angle, 199, 63);
        this.label = "spikes";
        this.texture = textures.spikes;
        this.collected_texture = textures.red_spikes;
        this.removeOnCollect = false;
        this.particleColor = color(50, 0, 0);
        this.sound = soundManager.sounds.spikes;
        this.idle_particles = false;
        this.start_y = y;
        this.showParticles = false;
        this.rain = new Rain(x, y + 20, 150, 0.05, 0.01, this.particleColor);
        this.init();
    }

    update() {
        this.body.position.y = this.start_y + (sin(frameCount / 50) * 5);
        this.rain.setYPosition(this.body.position.y + 20);
        this.rain.update();
        super.update();
    }

    render() {
        this.rain.render();
        super.render();
    }
}