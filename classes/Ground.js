class Ground {
    constructor(world, width = WIDTH, maxHeight = 100) {

        this.terrain = new Rectangle(world, WIDTH / 2, HEIGHT - 12.5, WIDTH, 25, {
            isStatic: true,
            label: "floor",
            friction: 1000000
        });
        Matter.World.add(world, this.terrain);
    }

    render() {
        this.terrain.render();
    }
}