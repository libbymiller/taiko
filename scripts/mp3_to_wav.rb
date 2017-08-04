files = Dir.glob("../sounds/*.mp3")

files.each do |f|
  fn = f.gsub("mp3","wav")
  `ffmpeg -i #{f} #{fn}`
end

