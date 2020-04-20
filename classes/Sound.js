class SoundManager {
    constructor(names, music) {
        this.sounds = {};
        for (let fileName of names) {
            let name = fileName.split(".")[0];
            this.sounds[name] = new Sound(name, fileName);
        }
        this.music = new Sound("music", music); ///loadSound(music);
        this.muted = false;
        this.musicMuted = false;
        this.mute_setting = "none";
        this.mute_setting = localStorage.getItem("mute");
        switch (this.mute_setting) {
            case "all":
                this.mute();
                break;
            case "music":
                this.muteMusic();
                break;
            case null:
                this.mute_setting = "none";
                break;
            default:
                break;
        }
        if (this.musicMuted) {
            this.music_volume = 0;
        } else {
            this.music_volume = localStorage.getItem("music_volume");
            if (this.music_volume) {
                try {
                    this.music_volume = parseFloat(this.music_volume);
                } catch (e) {
                    this.music_volume = 0.2;
                }
            } else {
                this.music_volume = 0.2;
            }
            console.log(this.music_volume);
            this.music.volume = this.music_volume;
            this.music.sound.setVolume(this.music_volume);
            music_slider_indicator.style.left = (this.music_volume * music_slider_width) + "px";
        }

    }

    save() {
        localStorage.setItem("mute", this.mute_setting);
    }

    setEffectVolume() {
        for (let sound in this.sounds) {
            this.sounds[sound].mute(!this.muted);
        }
    }

    setMusicVolume(volume) {
        this.music.setVolume(volume);
        localStorage.setItem("music_volume", volume);
    }

    muteMusic(mute) {
        //if(!this.musicMuted)
        if (!mute) mute = !this.musicMuted;
        this.music.mute(mute);
        this.musicMuted = mute;
        document.getElementById("mute_music_button").innerHTML = this.musicMuted ? "Unmute Music" : "Mute Music";
        if (this.mute_setting != "all") {
            this.mute_setting = this.musicMuted ? "music" : "none";
            this.save();
        }
        if (this.muted) {
            document.getElementById("mute_music_button").innerHTML = "Mute Music";
            document.getElementById("mute_music_button").classList.add("disabled");
        } else {
            document.getElementById("mute_music_button").classList.remove("disabled");
        }
    }

    mute() {
        for (let sound in this.sounds) {
            this.sounds[sound].mute(!this.muted);
        }
        this.muted = !this.muted;
        document.getElementById("mute_all_button").innerHTML = this.muted ? "Unmute All" : "Mute All";
        this.mute_setting = this.muted ? "all" : "none";
        this.muteMusic(this.muted);
        this.save();
    }
}

class Sound {
    constructor(name, fileName) {
        this.name = name;
        this.sound = loadSound("media/audio/" + fileName);
        this.volume = 1;
        this.sound.setVolume(this.volume);
        this.muted = false;
    }

    setVolume(volume) {
        if (volume > 0 && this.muted) this.muted = false;
        else if (volume == 0 && this.isPlaying()) this.stop();
        this.volume = volume;
        this.sound.setVolume(volume);
    }

    getVolume() {
        return this.volume;
    }

    play() {
        if (this.muted || this.volume <= 0) return;
        this.sound.play();
    }

    stop() {
        this.sound.stop();
    }

    isPlaying() {
        return this.sound.isPlaying();
    }

    mute(m) {
        if (m) {
            this.muted = true;
            this.sound.stop();
            this.sound.setVolume(0);
        } else {
            this.muted = false;
            this.sound.play();
            this.sound.setVolume(this.volume);
        }
    }
}