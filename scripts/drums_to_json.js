const fs = require("fs");
const OfflineAudioContext = require("web-audio-engine").OfflineAudioContext;

//ie. 10 min song max (?)
const context = new OfflineAudioContext(2, 44100 * 900, 44100);
var analyser = context.createAnalyser();


// Make the Uint8Array have the same size as the analyser’s bin count
var proc_data;
var all_proc_data = [];

function onProcess () {
  var proc_data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(proc_data);
  var idx = 0;
                    for (var j=0; j < analyser.frequencyBinCount; j++) {
                        if (proc_data[j] > proc_data[idx]) {
                            idx = j;
                        }
                    }
                    var frequency = idx * context.sampleRate / analyser.fftSize;
//                    console.log(frequency);
  all_proc_data.push(frequency);

}


function getPeaks(data2, p_data) {

  // What we're going to do here, is to divide up our audio into parts.

  // We will then identify, for each part, what the loudest sample is in that
  // part.

  // It's implied that that sample would represent the most likely 'beat'
  // within that part.

  // Each part is 0.5 seconds long - or 22,050 samples.

  // This will give us 60 'beats' - we will only take the loudest half of
  // those.

  // This will allow us to ignore breaks, and allow us to address tracks with
  // a BPM below 120.


  var data = [data2.getChannelData(0), data2.getChannelData(1)];

  //console.log("data length is "+data[0].length);
  //console.log("all proc data length is "+all_proc_data.length);
  var partSize = 22050,
      parts = data[0].length / partSize,
      peaks = [];
  var maxlast;
  for (var i = 0; i < parts; i++) {
    var max = 0;
    for (var j = i * partSize; j < (i + 1) * partSize; j++) {
      var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        var pos = Math.round(j/1024);
        max = {
          position: j,
          volume: volume,
          frequency: all_proc_data[pos] || 0
        };
      }
    }
    peaks.push(max);
    maxlast = max.volume;
    if(max.volume == 0 && maxlast == 0){
      //no more audio
      //console.log("no more audio - break");
      break;
    }
  }


  // We then sort the peaks according to volume...

  peaks.sort(function(a, b) {
    return b.volume - a.volume;
  });
  // ...take the loundest half of those...
  peaks = peaks.splice(0, peaks.length * 0.5);
  // ...and re-sort it back based on position.
  peaks.sort(function(a, b) {
    return a.position - b.position;
  });

  return peaks;
}


function getTimeFormatted(str){
    var st = parseFloat(str);
    var st_m = parseInt(Math.floor(st/60));
    var st_s = parseInt(Math.floor(st%60));
    if(st_s < 10){
      st_s = "0"+st_s;
    }
    if(st_m < 10){
      st_m = "0"+st_m;
    }
/*
console.log(str);
console.log(str%1);
console.log(str%1*1000);
console.log(Math.floor(str%1*1000));
console.log(parseInt(Math.floor(str%1*1000)));
console.log("");
*/
    var st_ms = parseInt(Math.floor(str%1*1000));
    if(st_ms < 100){
      st_ms = "0"+st_ms;
    }
    return "00:"+st_m+":"+st_s+"."+st_ms;
}

if(process.argv.length > 3){

  const buf = fs.readFileSync(process.argv[2]);

        context.decodeAudioData(buf, function(buffer) {


         try {  

          // Create buffer source
          var source = context.createBufferSource();
          source.buffer = buffer;


          //trying this instead: http://www.independentrecording.net/irn/resources/freqchart/main_display.htm
          // First a lowpass to remove most of the song.
          //trying to capturethe drums - 40 - 105

          var lowpass = context.createBiquadFilter();
          lowpass.type = "lowpass";

          if(process.argv[3]=="low"){
            lowpass.frequency.value = 80;
          }else{
            lowpass.frequency.value = 1000;
          }
          lowpass.Q.value = 1;

          // Run the output of the source through the low pass.

          source.connect(lowpass);

          // Now a highpass to remove the bassline.

          var highpass = context.createBiquadFilter();
          highpass.type = "highpass";
          if(process.argv[3]=="low"){
            highpass.frequency.value = 20;
          }else{
            highpass.frequency.value = 200;
          }
          highpass.Q.value = 1;

          // Run the output of the lowpass through the highpass.

          lowpass.connect(highpass);

          var proc = context.createScriptProcessor(1024, 1, 1);

          highpass.connect(analyser);
          analyser.connect(proc);
          //console.log( " analyser.fftSize; "+analyser.fftSize);
          //all_proc_data = new Uint8Array(analyser.frequencyBinCount);

          // Run the output of the highpass through our offline context.
          highpass.connect(context.destination);

          proc.connect(context.destination);
          proc.onaudioprocess = onProcess;

          source.start(0);
          context.startRendering();


         } catch (e) {
          console.error(e);
          console.trace();
         }

        });

        var count = 1;

        context.oncomplete = function(e) {
          var str = "WEBVTT FILE\n\n";
          var buffer = e.renderedBuffer;
          var peaks = getPeaks(buffer, proc_data);
          var cues = [];
          for(var i = 0; i<peaks.length; i++){
//             if(peaks[i]["volume"] > 0.009){ // test only
//             if(peaks[i]["volume"] > 0.2){
               var secs = (peaks[i]["position"])/44100;
               str = str +""+(count)+"\n";
               cues.push({"id":count, "start":secs, "volume":peaks[i]["volume"]});     
               count = count + 1;
             }
//          }
          console.log(JSON.stringify(cues, null, 2));          
        }
}
