class Coin extends Collectable {
    constructor(world, x, y) {
        super(world, x, y);
        this.label = "coin";
        this.color = YELLOW;
        this.particleColor = color(255, 198, 10);
        this.texture = textures.coin;
        this.init();
    }

    render() {
        if (super.render()) {
            push();
            translate(this.position.x, this.position.y);
            rotate(frameCount / 100);
            image(textures.coin_overlay, 0, 0, this.width, this.height);
            pop();
        }
    }
}