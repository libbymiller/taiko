const fs = require("fs");
const OfflineAudioContext = require("web-audio-engine").OfflineAudioContext;

//ie. 10 min song max (?)
const context = new OfflineAudioContext(2, 44100 * 600, 44100);

function getPeaks(data) {

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

  var partSize = 22050,
      parts = data[0].length / partSize,
      peaks = [];
  var maxlast;
  for (var i = 0; i < parts; i++) {
    var max = 0;
    for (var j = i * partSize; j < (i + 1) * partSize; j++) {
      var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        max = {
          position: j,
          volume: volume
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
    var st_ms = parseInt(Math.floor(str%1*1000));
    return "00:"+st_m+":"+st_s+"."+st_ms;
}

const buf = fs.readFileSync("sounds/test.wav");

        context.decodeAudioData(buf, function(buffer) {

          // Create buffer source
          var source = context.createBufferSource();
          source.buffer = buffer;

          // Beats, or kicks, generally occur around the 100 to 150 hz range.
          // Below this is often the bassline.  So let's focus just on that.

          // First a lowpass to remove most of the song.

          var lowpass = context.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = 150;
          lowpass.Q.value = 1;

          // Run the output of the source through the low pass.

          source.connect(lowpass);

          // Now a highpass to remove the bassline.

          var highpass = context.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 100;
          highpass.Q.value = 1;

          // Run the output of the lowpass through the highpass.

          lowpass.connect(highpass);

          // Run the output of the highpass through our offline context.

          highpass.connect(context.destination);

          // Start the source, and render the output into the offline conext.

          source.start(0);
          context.startRendering();
        });

        context.oncomplete = function(e) {
          var str = "WEBVTT FILE\n\n";
          var buffer = e.renderedBuffer;
          var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
          //console.log(peaks.length);
          for(var i = 0; i<peaks.length; i++){
             var secs = (peaks[i]["position"])/44100;
             //console.log(getTimeFormatted(secs)); 
             str = str +""+(i+1)+"\n";
             if(i == 0){
                str = str + getTimeFormatted(secs)+" --> "+getTimeFormatted(secs+1)+" D:vertical A:start\n";
             }else{
                str = str + getTimeFormatted(secs)+" --> "+getTimeFormatted(secs+1)+"\n";
             }
             str = str + peaks[i]["volume"]+"\n\n";
          }
          console.log(str);          
        }


