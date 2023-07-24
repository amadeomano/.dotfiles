# Empty greeting message
set fish_greeting

# set config path
set -x XDG_CONFIG_HOME "$HOME/.config"

# add bins to paths
fish_add_path $HOME/.config/tmux/plugins/t-smart-tmux-session-manager/bin
fish_add_path /opt/homebrew/bin/
fish_add_path /opt/homebrew/sbin/
