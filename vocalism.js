/**
 * Vocalism
 * @author Kit Zellerbach
 */


function Vocalism() {
    // ...
}

// Audio Recording
var chunks = [];
var canvasWidth = 200;
var canvasHeight = 50;

const actx = Tone.context;
const dest = actx.createMediaStreamDestination();
var waveform = new Tone.Analyser('waveform', 256);
var motu = new Tone.UserMedia();
motu.open().then(function () {
    motu.connect(dest);
    motu.fan(waveform);
});

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

    this.sequence = function (a, b) {
        var seq = new Tone.Sequence(function (time, note) {
            MARIMBA.triggerAttack(note);
        }, a, b);
        seq.start();
        Tone.Transport.start();
    };

    this.note = function (n) {
        console.log("trig");
        MARIMBA.triggerAttack(n);
    };

    return this;
}

function Audio() {
    this.recorder = new MediaRecorder(dest.stream);

    this.record = function () {
        this.recorder.start();

        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "1px solid";

        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
        this.waveContext = canvas.getContext("2d");
        this.recordWidget = cm.doc.addLineWidget(cm.doc.getCursor().line, canvas, {
            coverGutter: false,
            noHScroll: true,
            above: false
        });
        var that = this;

        function recordLoop() {
            requestAnimationFrame(recordLoop);
            //get the waveform valeus and draw it
            var waveformValues = waveform.getValue();
            drawWaveform(that.waveContext, waveformValues);
        }

        recordLoop();
    };

    this.stopRecord = function () {
        this.recorder.stop();
        this.recordWidget.clear();
    };

    this.stop = function () {
        this.player.stop();
        this.startWidget.clear();
    };

    this.start = function () {
        this.player.start();

        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "1px solid";

        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
        this.waveContext = canvas.getContext("2d");
        this.startWidget = cm.doc.addLineWidget(cm.doc.getCursor().line, canvas, {
            coverGutter: false,
            noHScroll: true,
            above: false
        });

        var that = this;

        function startLoop() {
            requestAnimationFrame(startLoop);
            var waveformValues = that.waveform.getValue();
            drawWaveform(that.waveContext, waveformValues);
        }

        startLoop();
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

    this.bitCrusher = function (a) {
        this.player.connect(new Tone.BitCrusher(a).toMaster());
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

    this.loop = function () {
        this.player.loop = !this.player.loop;
    };

    this.sequence = function (a, b) {
        var that = this;
        var seq = new Tone.Sequence(function (time, note) {
            that.sampler.triggerAttack(note);
        }, a, b);
        seq.start();
        Tone.Transport.start();
    };

    this.recorder.ondataavailable = evt => chunks.push(evt.data);
    this.recorder.onstop = evt => {
        let blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});

        this.waveform = new Tone.Analyser('waveform', 256);
        this.player = new Tone.Player({
            "url": URL.createObjectURL(blob),
            "autostart": false,
            "loop": false
        }).fan(this.waveform).toMaster();

        this.sampler = new Tone.Sampler({
            "C3" : URL.createObjectURL(blob),
        }).toMaster();

        chunks = [];
    };
    return this;
}

function drawWaveform(waveContext, values) {
    waveContext.canvas.width = canvasWidth;
    waveContext.canvas.height = canvasHeight;
    waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
    waveContext.clearColor = "black";
    waveContext.beginPath();
    waveContext.lineJoin = 'round';
    waveContext.lineWidth = 1;
    waveContext.strokeStyle = "white";
    waveContext.moveTo(0, (values[0] / 255) * canvasHeight);
    for (var i = 1, len = values.length; i < len; i++) {
        var val = values[i] / 255;
        var x = canvasWidth * (i / len);
        var y = (val * 100) * canvasHeight + canvasHeight / 2;
        waveContext.lineTo(x, y);
    }
    waveContext.stroke();
}
