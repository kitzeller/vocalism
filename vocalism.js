function Vocalism() {
    // ...
}

// Audio Recording
var stream;
var chunks = [];

const handleSuccess = function (str) {
    stream = str;
};

navigator.mediaDevices.getUserMedia({audio: true, video: false})
    .then(handleSuccess);

var DIST = new Tone.Distortion(0.8).toMaster();
var REVERB = new Tone.Convolver('https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/hm2_000_ortf_48k.mp3').toMaster();
var PINGPONG = new Tone.PingPongDelay("4n", 0.2).toMaster();

var MARIMBA = new Tone.Sampler({
    C3: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c3.mp3',
    'D#3': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds3.mp3',
    'F#3': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs3.mp3',
    A3: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a3.mp3',
    C4: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c4.mp3',
    'D#4': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds4.mp3',
    'F#4': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs4.mp3',
    A4: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a4.mp3',
    C5: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c5.mp3',
    'D#5': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds5.mp3',
    'F#5': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs5.mp3',
    A5: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a5.mp3'
}).toMaster();

function Sampler() {

    this.reverb = function () {
        MARIMBA.connect(REVERB);
    };

    this.dist = function (a) {
        // MARIMBA.connect(DIST);
        MARIMBA.connect(new Tone.Distortion(a).toMaster());
    };

    this.pingPong = function (a, b) {
        // MARIMBA.connect(PINGPONG)
        MARIMBA.connect(new Tone.PingPongDelay(a, b).toMaster());
    };

    this.note = function (n) {
        console.log("trig");
        MARIMBA.triggerAttack(n);
    };

    return this;
}

function Audio() {
    this.recorder = new MediaRecorder(stream);

    this.record = function () {
        this.recorder.start();
    };

    this.stopRecord = function () {
        this.recorder.stop();
    };

    this.stop = function () {
        this.player.stop()
    };

    this.start = function () {
        this.player.start()
    };

    this.reverb = function () {
        this.player.connect(REVERB);
    };

    this.distort = function (a) {
        this.player.connect(new Tone.Distortion(a).toMaster());
    };

    this.pingPong = function (a, b) {
        this.player.connect(new Tone.PingPongDelay(a, b).toMaster());
    };

    this.reset = function () {
        this.player.disconnect();
        this.player.toMaster().start()
    };

    this.volume = function (a) {
        this.player.volume.value = a;
    };

    this.speed = function (a) {
        // 1 is normal
        this.player.playbackRate = a;
    };

    this.reverse = function () {
        this.player.reverse = !this.player.reverse;
    };

    this.recorder.ondataavailable = evt => chunks.push(evt.data);
    this.recorder.onstop = evt => {
        let blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});

        this.player = new Tone.Player({
            "url": URL.createObjectURL(blob),
            "autostart": true,
            "loop": true
        }).toMaster();

        chunks = [];
    };
    return this;
}
