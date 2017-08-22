files = Dir.glob("../sounds/*.wav")

files.each do |f|
  fn = f.gsub("wav","vtt")
  fn = fn.gsub("sounds", "tracks")
  fn1 = fn.gsub(".vtt", "1.vtt")

#  `node peaks_as_vtt_cues.js #{f}  > #{fn}`

  puts "node drums_to_cues.js #{f} low  > #{fn1}"
  `node drums_to_cues.js #{f} "high"  > #{fn1}`
  sleep(1)

  puts "node drums_to_cues.js #{f} high  > #{fn}"
  `node drums_to_cues.js #{f} "low"  > #{fn}`

  sleep(1)

end

