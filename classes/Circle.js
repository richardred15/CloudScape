class Circle extends BaseObject {
    constructor(world, x, y, radius, options) {
        super(world, x, y);
        this.radius = radius;
        this.options = options;
        this.body = Matter.Bodies.circle(x, y, radius, options);
        Matter.World.add(world, this.body);
    }

    render() {
        super.render();
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        ellipse(0, 0, 2 * this.radius);
        pop();
    }
}