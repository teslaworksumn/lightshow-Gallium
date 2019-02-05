var portAudio = require('naudiodon');
var math = require('mathjs');
const DMX = require('dmx');


const dmx = new DMX();


var universe = dmx.addUniverse('demo', 'enttec-usb-dmx-pro', '/dev/ttyUSB0');


/*
Simple beat detection algorithm from
   http://archive.gamedev.net/archive/reference/programming/features/beatdetection/index.html
*/

const historyLength = 43;

var audioHistory = new Array(historyLength).fill(0);
var audioHistoryIndex = 0; // index of oldest element
var bufferArray = []
var bufferwait = 0;


// hardcode deviceId for Blue snowball
var ai = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: 44100,
  deviceId: -1 // Use -1 or omit the deviceId to select the default device
});

// handle errors from the AudioInput
ai.on('error', err => console.error);
ai.on('data', react);
ai.start();

// returns an array that is a frame of audio data
function decodeBuffer(buffer) {
  return Array.from(
    { length: buffer.length / 2 },
    (v, i) => buffer.readInt16LE(i * 2) / (2 ** 15)
  );
}

function react(buffer) {
  if (bufferwait == 8) {
    var concatBuffer = Buffer.concat(bufferArray);
    var audio_frame = decodeBuffer(concatBuffer);
    bufferArray = []
    bufferwait = 0
    //detectBeat(audio_frame);
    if (detectBeat(audio_frame)) {
      console.log('----------------------------------');
        universe.updateAll(255);
    } else {
      console.log('.');
        universe.updateAll(0);
    }
  }
  else {
    bufferArray.push(buffer)
    bufferwait = bufferwait + 1;
  }

}

function detectBeat(frame) {

  /*
  let samples = Array.from(
    { length: frame.length },
    (i) => i * 32768
  );
  */

  frame.map(function (x) { return x * 32768; });



  // optimized sum of squares, i.e faster version of (samples**2).sum()

  //let instantEnergy = math.norm(math.dotMultiply(frame,frame)) ;
  let instantEnergy = math.dot(frame, frame);

  let audioHistoryAverage = math.mean(audioHistory);
  let audioHistoryVariance = math.var(audioHistory);

  // constants taken from website referenced at top of file
  let beatSensibility = (-.0025714 * audioHistoryVariance) + 1.15142857;
  let beat = instantEnergy > beatSensibility * audioHistoryAverage;

  // replace energy value in buffer
  audioHistory[audioHistoryIndex] = instantEnergy;
  audioHistoryIndex -= 1;

  if (audioHistoryIndex < 0) {
    audioHistoryIndex = audioHistory.length - 1;
  }

  /*
  console.log("instantEnergy:", instantEnergy);
  console.log("beatSensibility", beatSensibility);
  console.log("other:", beatSensibility * audioHistoryAverage);
  console.log(" ");
  */

  return beat;
}
