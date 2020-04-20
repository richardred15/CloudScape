class Balloon extends Collectable {
    constructor(world, x, y, angle) {
        super(world, x, y, angle, 32, 93);
        this.label = "balloon";
        this.texture = textures.balloon;
        this.init();
    }
}