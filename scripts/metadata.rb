require 'json'

#0. order by date added, reversed
#1. make wavs from mp3s
#2. make subtitles files from mp3s
#3. generate html files??


files = Dir.glob("../sounds/*.mp3")

count = 0
data = []

files.each do |line|
  puts line
  url = line.strip

  vtt = line.gsub("../sounds/","tracks/")
  vtt = vtt.gsub(".mp3",".vtt")
  vtt1 = vtt.gsub(".vtt","1.vtt")

  url = line.gsub("../","")
  metadata = line.strip
  metadata = metadata.gsub("_", " ")
  metadata = metadata.gsub("../sounds/", "")
  metadata = metadata.gsub(".mp3", "")

  music = {"url"=>url, "title"=> metadata, "vtt"=>vtt, "vtt1"=>vtt1 }
  data.push(music)
  count = count + 1
end

File.open("../metadata.json", 'w') { |file| file.write("var metadata = "+JSON.pretty_generate(data)) }


