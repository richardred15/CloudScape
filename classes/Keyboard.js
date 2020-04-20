class Keyboard {
    constructor() {
        this.pressed = [];
        this.pressedKeyCodes = [];
        this.lifted = [];
        this.shift = false;
        this.ctrl = false;
    }

    isKeyDown(key) {
        if (typeof key == "string") {
            key = key.toLowerCase();
            return this.pressed.indexOf(key) != -1;
        } else if (typeof key == "number")
            return this.pressedKeyCodes.indexOf(key) != -1;
        else
            return false;
    }

    handler(event, keyboard) {
        if (!soundManager.music.isPlaying()) {
            soundManager.music.play();
        }
        keyboard.lifted = [];
        let up = (event.type == 'keyup');
        let key = event.key.toLowerCase();
        let held = keyboard.isKeyDown(key);
        if (up) {
            if (event.keyCode == 16) {
                this.shift = false;
            } else if (event.keyCode == 17) {
                this.ctrl = false;
            } else if (held) {
                keyboard.pressed.splice(keyboard.pressed.indexOf(key), 1);
                keyboard.pressedKeyCodes.splice(keyboard.pressedKeyCodes.indexOf(event.keyCode), 1);
                keyboard.lifted.push(event.keyCode);
            }
        } else {
            if (event.keyCode == 16) {
                this.shift = true;
            } else if (event.keyCode == 17) {
                this.ctrl = true;
            } else if (!held) {
                keyboard.pressed.push(key);
                keyboard.pressedKeyCodes.push(event.keyCode);
            }
        }
    }
}