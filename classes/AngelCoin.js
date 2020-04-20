class AngelCoin extends Collectable {
    constructor(world, x, y, angle) {
        super(world, x, y, angle, 64, 31);
        this.label = "angel_coin";
        this.texture = textures.angel_coin;
        this.particleColor = WHITE;
        this.init();
    }
}