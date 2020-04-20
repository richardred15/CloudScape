class Rectangle extends BaseObject {
    constructor(world, x, y, width, height, options) {
        super(world, x, y);
        this.width = width;
        this.height = height;
        this.options = options;
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body);
        this.color = THEME_COLOR;
        this.rain = new Rain(0, 0, width, 0.05, 0.005);
        this.raining = false;
    }

    update() {
        super.update();
        if (this.raining) {
            this.rain.update();
            push();
            translate(this.position.x, this.position.y);
            rotate(this.angle);
            this.rain.render();
            pop();
        }
    }

    render() {
        super.render();
        push();
        noStroke();
        fill(this.color);
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        rect(0, 0, this.width, this.height);
        pop();
    }
}