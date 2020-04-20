class BaseObject {
    constructor(world, x, y) {
        this.world = world;
        this.position = {
            x: x,
            y: y
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.removed = false;
        this.raining = false;
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
    }

    render() {
        if (this.removed) return;
        this.update();
    }
}