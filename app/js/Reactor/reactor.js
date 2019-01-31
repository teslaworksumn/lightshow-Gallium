var portAudio = require('naudiodon');

var ai = new portAudio.AudioInput({
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId : -1 // Use -1 or omit the deviceId to select the default device
  });

  // handle errors from the AudioInput
  ai.on('error', err => console.error);
  ai.on('data',react);
  ai.start();

function decodeBuffer (buffer) {
  return Array.from(
    { length: buffer.length / 2 },
    (v, i) => buffer.readInt16LE(i * 2) / (2 ** 15)
  );
}

function react(buffer) {
  var fft_gain=0.13; //from python version of reactor configs/config.yaml
  var vu_gain=1; //from python version of reactor configs/config.yaml
  var vu_frame = decodeBuffer(buffer);
  fft_frame=vu_frame.forEach(function(x) {
    return x*fft_gain/vu_gain;
  });
}