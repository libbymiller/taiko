files = Dir.glob("../sounds/*.wav")

files.each do |f|
  fn = f.gsub("wav","json")
  fn = fn.gsub("sounds", "tracks")
  fn1 = fn.gsub(".json", "1.json")

  puts "node drums_to_json.js #{f} low  > #{fn1}"
  `node drums_to_json.js #{f} "low"  > #{fn1}`
  sleep(1)

  puts "node drums_to_json.js #{f} high  > #{fn}"
  `node drums_to_json.js #{f} "high"  > #{fn}`

  sleep(1)

end

