const OFF = 0;
const FAST = 1;
const FANCY = 2;

class Clouds {
    constructor(texture) {
        this.texture = texture;

        this.clouds = [];

        this.quality = localStorage.getItem("clouds");
        if (this.quality != null) {
            if (this.quality == "true") {
                this.quality = FANCY;
            } else if (this.quality == "false") {
                this.quality = OFF;
            }
        } else {
            this.quality = FANCY;
        }
        this.updateQuality();
        for (let j = 0; j < 10; j++) {
            this.newCloud(true);
        }
    }

    toggleQuality() {
        this.quality++;
        if (this.quality > FANCY) this.quality = OFF;
        this.updateQuality();
    }

    updateQuality() {
        let str = "Clouds: " + (this.quality == OFF ? "Off" : this.quality == FANCY ? "Fancy" : "Fast");
        document.getElementById("disable_cloud_button").innerHTML = str;
        localStorage.setItem("clouds", this.quality);
    }

    newCloud(init = false) {
        let speedMultiplier = (this.quality == FAST ? 0.01 : 0.02);
        let f = Math.random() < 0.5 ? false : true;
        this.clouds.unshift({
            rotation: QUARTER_PI * rand() - QUARTER_PI,
            location: {
                x: !init ? (Math.random() * -200) - 200 : random(0, WIDTH),
                y: random(-25, HEIGHT)
            },
            front: f,
            speed: ((f ? 2 : 1) * speedMultiplier) + speedMultiplier,
            lobes: this.getLobes(),
            opacity: 0.2,
        });
    }

    getLobes(count = 5) {
        let lobes = [];
        for (let i = 0; i < count; i++) {
            lobes.push([(Math.random() * 200) - 100, (Math.random() * 200) - 100, (Math.random() * 50) + 100])
        }
        return lobes;
    }

    newClouds() {

    }

    renderCloud(cloud, index) {
        push();
        translate(cloud.location.x, cloud.location.y);
        rotate(cloud.rotation);
        fill(`rgba(255,255,255,${cloud.opacity})`);
        if (this.quality == FAST) {
            for (let lobe of cloud.lobes) {
                ellipse(lobe[0], lobe[1], lobe[2]);
                //arc(lobe[0], lobe[1], lobe[2], lobe[2], 0, PI + QUARTER_PI, CHORD);
            }
        } else if (this.quality == FANCY) {
            image(this.texture, 0, 0);
        }
        pop();
        cloud.location.x += cloud.speed * deltaTime;
        if (cloud.location.x > WIDTH + 500) {
            this.clouds.splice(index, 1);
        }
    }

    render() {
        if (this.quality == OFF) {
            image(textures.bg_over, WIDTH / 2, HEIGHT / 2);
            return;
        }
        push();
        noStroke();
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            let cloud = this.clouds[i];
            if (cloud.front) continue;
            this.renderCloud(cloud, i);
        }
        image(textures.bg_over, WIDTH / 2, HEIGHT / 2);
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            let cloud = this.clouds[i];
            if (!cloud.front) continue;
            this.renderCloud(cloud, i);
        }
        pop();

        if (this.clouds.length < 10) {
            this.newCloud();
        }
    }
}