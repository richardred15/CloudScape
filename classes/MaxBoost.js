class MaxBoost extends Collectable {
    constructor(world, x, y) {
        super(world, x, y);
        this.label = "boost";
        this.texture = textures.boost;
        this.particleColor = RED;
        this.init();
    }

    render() {
        if (super.render()) {
            push();
            translate(this.position.x, this.position.y);
            rotate(frameCount / 100);
            image(textures.boost_overlay, 0, 0, this.width, this.height);
            pop();
        }
    }
}