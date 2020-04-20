let RED;
let YELLOW;
let BLUE;
let GREEN;
let BLACK;
let WHITE;
let DARK_COLOR;
let THEME_COLOR;
let DARK = "dark";
let LIGHT = "light";
let theme = LIGHT;

let WIDTH = 800; //window.innerWidth;
let HEIGHT = 600; //window.innerHeight;

let clouds;
let game;

let music;
let playing = false;
let imageFiles = [
    ["player", "body", "body_right", "body_left", "head", "head_right", "head_left"],
    "roof",
    "wings",
    "bg_over",
    "highlight",
    "bar",
    "win",
    "balloon",
    "cloud_tiny",
    "angel_coin",
    "spikes",
    "red_spikes",
    "hud",
    "boost",
    "boost_overlay",
    "coin",
    "coin_overlay",
    "overlay",
    "glow",
    "glow_scored",
    "cup",
    "obstacle"
];
let textures = {};

let soundManager;

let bounceCountdown = 0;
p5.disableFriendlyErrors = true;

let level_cache = {};
let theme_path;

function preload() {
    theme_path = `https://richard.works/projects/Cloudscape/media/${theme == DARK ? "dark" : "images"}/`;
    soundManager = new SoundManager(["fizzle.wav",
            "woosh_high.wav",
            "woosh.wav",
            "spikes.mp3",
            "boost.wav",
            "collect.wav",
            "jump.wav",
            "bounce.mp3",
            "success.mp3",
            "chips.mp3",
            "click.mp3"
        ],
        "loop1.wav");
    loadImages();

    for (let name of level_names) {
        loadJSON("levels/" + name + ".json", function (data) {
            level_cache[name] = data;
        });
    }
    theme = getTheme();
    setThemePath(theme);
}

function loadImages() {
    for (let file of imageFiles) {
        if (typeof file == "string") {
            loadImage(theme_path + file + ".png", function (img) {
                console.log(img);
                textures[file] = img;
            });
        } else {
            let name = file[0];
            console.log(name);
            textures[name] = {};
            for (let i = 1; i < file.length; i++) {
                let n = file[i];
                loadImage(`${theme_path}${name}/${n}.png`, function (img) {
                    textures[name][n] = img;
                });
            }
            //textures[file]
        }
    }
}

let framerates = [];
let avgFramerate = 0;
let levels = [{
    obstacles: [],
    coins: [],
    boosts: []
}];
let default_levels = levels;

let level_names = ["one", "two", "three", "four"];

let windowScale = window.innerHeight / HEIGHT;

function getTheme() {
    let stored = localStorage.getItem("theme");
    return stored || LIGHT;
}

function setThemePath(t = theme) {
    theme_path = `https://richard.works/projects/Cloudscape/media/${t == DARK ? "dark" : "images"}/`;
}

function setTheme(t) {
    if (t == theme) return;
    theme = t;
    //theme_path = `https://richard.works/projects/Cloudscape/media/${t == DARK ? "dark" : "images"}/`;
    let theme_folder = "images";
    let button_text_color = "black";
    THEME_COLOR = "white";
    switch (t) {
        case DARK:
            theme_folder = "dark";
            button_text_color = "white";
            THEME_COLOR = DARK_COLOR;
            break;
        default:
            break;
    }
    theme_path = `https://richard.works/projects/Cloudscape/media/${theme_folder}/`;
    loadImages();

    document.querySelector("canvas").style.backgroundImage = `url(${theme_path}bg_under.png)`;
    document.getElementById("menu").style.backgroundImage = `url(${theme_path}win.png)`;
    document.querySelectorAll(".button").forEach((e) => {
        e.style.backgroundImage = `url(${theme_path}button.png)`;
        e.style.color = button_text_color;
    })
    if (game) {
        game.clouds.texture = textures.cloud_tiny;
        for (let spike of game.level.scenes[0].layers[0].spikes) {
            spike.texture = textures.spikes;
        }
        game.walls.forEach((e) => {
            e.color = THEME_COLOR;
        });
        game.floor.terrain.color = THEME_COLOR;
    }
    localStorage.setItem("theme", t);
}

function setup() {

    RED = color(255, 0, 0);
    YELLOW = color(255, 255, 0);
    BLUE = color(0, 0, 255);
    GREEN = color(0, 255, 0);
    BLACK = color(0, 0, 0);
    WHITE = color(255);
    DARK_COLOR = color(51);
    THEME_COLOR = DARK_COLOR;
    let canvas = createCanvas(WIDTH, HEIGHT);
    setTheme(theme);


    levels = [];
    for (let level of level_names) {
        levels.push(level_cache[level]);
    }
    default_levels = levels;
    imageMode(CENTER);
    rectMode(CENTER);
    ellipseMode(CENTER);
    textAlign(CENTER);
    game = new Game();
    window.onkeydown = window.onkeyup = function (e) {
        game.keyboard.handler(e, game.keyboard);
    }
    document.getElementById("overlay").style.opacity = "1";
    setInterval(function () {
        framerates.push(frameRate());
        if (framerates.length > 100) framerates.shift();
        avgFramerate = 0;
        for (let frame of framerates) {
            avgFramerate += frame;
        }
        avgFramerate /= framerates.length;
    }, 100);

    document.querySelectorAll(".button").forEach(e => {
        e.onmouseenter = function () {
            console.log("MOUSE");
            soundManager.sounds.chips.play();
        }
        e.onmousedown = function () {
            if (!e.classList.contains("disabled")) {
                soundManager.sounds.click.play();
            }
            return true;
        }
    })

    canvas.elt.onclick = function (e) {
        game.onclick(e);
    }

    textFont('Bubblegum Sans');

}

let userScale = 1;

function draw() {
    push();
    if (!game.paused && !game.win && game.player.body.position.y < 48) {
        translate(0, -(game.player.body.position.y - 48));
    }
    scale(userScale, userScale);
    game.render();
    pop();
    game.hud.render();

    if (GameSettings.debug) {
        push();
        noStroke();
        fill("rgba(255,255,255,0.4)")
        rect(100, 75, 200, 50);
        textSize(32);
        fill("rgba(0,0,0,0.5)");
        text(frameRate().toFixed(2) + ":" + avgFramerate.toFixed(2), 100, 82);
        textSize(24);
        let mx = (mouseX / windowScale).toFixed(2);
        let my = (mouseY / windowScale).toFixed(2);
        text(`${mx}, ${my}`, mx, my);
        pop();
    }

}

function scaleToBrowser() {
    WIDTH = windowScale * 800;
    HEIGHT = window.innerHeight;
    userScale = windowScale;
    resizeCanvas(WIDTH, HEIGHT);
}

let music_slider_indicator = document.getElementById("music_slider_indicator");
let adjusting_music_volume = false;
let music_min_pos = music_slider_indicator.parentElement.getBoundingClientRect().x;
let music_slider_width = music_slider_indicator.parentElement.clientWidth;
let music_max_pos = music_min_pos + music_slider_width;

window.onmouseup = function () {
    adjusting_music_volume = false;
}

window.onmousemove = function (e) {
    if (adjusting_music_volume) {
        let x = e.pageX;
        let y = e.pageY;
        setMusicFromMousePosition(x, y);
    }
}

music_slider_indicator.parentElement.onmousedown = function (e) {
    adjusting_music_volume = true;
    let x = e.pageX;
    let y = e.pageY;
    setMusicFromMousePosition(x, y);
}

function setMusicFromMousePosition(x, y) {
    if (x > music_max_pos) x = music_max_pos;
    if (x < music_min_pos) x = music_min_pos;
    x -= music_min_pos;
    music_slider_indicator.style.left = x + "px";
    let volume = x / music_slider_width;
    soundManager.setMusicVolume(volume);
}

let option_buttons = document.getElementById("option_buttons");
let help_menu = document.getElementById("help_menu");
let main_buttons = document.getElementById("main_buttons");
let showing_options = false;
let showing_help = false;

function toggleOptions() {
    if (showing_options) {
        main_buttons.classList.add("showing");
        option_buttons.classList.remove("showing");
        document.getElementById("header").innerHTML = "Menu";
    } else {
        main_buttons.classList.remove("showing");
        option_buttons.classList.add("showing");
        document.getElementById("header").innerHTML = "Options";
    }
    showing_options = !showing_options;
}

function toggleHelp() {
    if (showing_help) {
        main_buttons.classList.add("showing");
        help_menu.classList.remove("showing");
        document.getElementById("header").innerHTML = "Menu";
    } else {
        main_buttons.classList.remove("showing");
        help_menu.classList.add("showing");
        document.getElementById("header").innerHTML = "Tutorial";
        localStorage.setItem("tutorial", "true");
    }
    showing_help = !showing_help;
}


window.onclick = window.ontouchstart = function (e) {
    if (!soundManager.music.isPlaying()) {
        soundManager.music.play();
    }
}

window.onfocus = function () {
    if (game.levelSelectionMode) game.levelManager.loadMyLevels();
}

window.onblur = function () {
    if (adjusting_music_volume) adjusting_music_volume = false;
    if (!game.levelSelectionMode && !game.paused) game.pause();
}

window.onresize = function () {}

function pxToNum(string) {
    string = string.replace("px", "");
    return parseInt(string);
}

function ajax(url, complete, error) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        var DONE = 4;
        var OK = 200;
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                if (complete != undefined) complete(xhr.responseText);
            }
        } else {
            if (error != undefined) error();
        }
    }
};

function rand() {
    let r = Math.random();
    for (let i = 0; i < 100; i++) {
        r += Math.random()
    };
    return r - Math.floor(r);
}
/* 
setInterval(() => {
    console.log(ParticleTrail.particle_count, ParticleTrail.existing_trails, Rain.instances, Rain.counts);
}, 500); */