function set_wallpaper -d "Set wallpaper"
    echo "Setting to $argv"
    osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$(pwd)/$argv\" as POSIX file"
end

function dot -d "git wrapper for dot files"
    git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME $argv
end

function code -d "WebStorm wrapper"
    open -na WebStorm.app --args (pwd)/$argv
end

function sub -d "SublimeText wrapper"
    /Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl --args (pwd)/$argv
end
