function set_wallpaper -d "Set wallpaper"
    echo "Setting to $argv"
    osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$(pwd)/$argv\" as POSIX file"
end