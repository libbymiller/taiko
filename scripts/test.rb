# this verion just looks for generated drum files - for testing - from http://www.drumbot.com/projects/sequence/
require 'json'

files = Dir.glob("../sounds/drum*.wav")

files.each do |f|
  fn = f.gsub("wav","json")
  fn = fn.gsub("sounds", "tracks")
  fn1 = fn.gsub(".json", "1.json")

  puts "node drums_to_json.js #{f} low  > #{fn1}"
  `node drums_to_json.js #{f} "high"  > #{fn1}`
  sleep(1)

  puts "node drums_to_json.js #{f} high  > #{fn}"
  `node drums_to_json.js #{f} "low"  > #{fn}`

  sleep(1)

end

files = Dir.glob("../sounds/drum*.wav")

files.each do |f|
  fn = f.gsub("wav","mp3")
  `ffmpeg -i #{f} #{fn}`
end


files = Dir.glob("../sounds/drum*.mp3")

count = 0
data = []

files.each do |line|
  puts line
  url = line.strip

  json = line.gsub("../sounds/","tracks/")
  json = json.gsub(".mp3",".json")
  json1 = json.gsub(".json","1.json")

  url = line.gsub("../","")
  metadata = line.strip
  metadata = metadata.gsub("_", " ")
  metadata = metadata.gsub("../sounds/", "")
  metadata = metadata.gsub(".mp3", "")

  music = {"url"=>url, "title"=> metadata, "json"=>json, "json1"=>json1 }
  data.push(music)
  count = count + 1
end

File.open("../metadata.json", 'w') { |file| file.write("var metadata = "+JSON.pretty_generate(data)) }
