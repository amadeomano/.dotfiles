mov2gif() {
  # $1 input.mp4

  filename=$(basename -- "$1")
  ext="${filename##*.}"
  name="${filename%.*}"
  echo $name '&&' $ext

  ffmpeg -i $1 $name.gif
  echo 'Done FFMPEG: ' $name.gif "\n"


  gifsicle -O2 $name.gif -o $name-opt.gif
  echo 'Done Gifsicle: ' $name-opt.gif "\n"
}
