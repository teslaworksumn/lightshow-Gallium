var fs = require('fs');
var portAudio = require('naudiodon');
 
// Create an instance of AudioInput, which is a ReadableStream
var audioInput = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: 44100,
  deviceId: -1 // Use -1 or omit the deviceId to select the default device
});
 
// handle errors from the AudioInput
audioInput.on('error', err => console.error);
 
// Create a write stream to write out to a raw audio file
var writeStream = fs.createWriteStream('rawAudio.raw');
 
//Start streaming
audioInput.pipe(process.stdout);
audioInput.start();




function showData() {

}
