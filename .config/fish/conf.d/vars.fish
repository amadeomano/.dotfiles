# Empty greeting message
set fish_greeting

# set config path
set -x XDG_CONFIG_HOME "$HOME/.config"

# set config path
set -gx GPG_TTY (tty)

# add bins to paths
fish_add_path $HOME/.config/tmux/plugins/t-smart-tmux-session-manager/bin
fish_add_path /opt/homebrew/bin/
fish_add_path /opt/homebrew/sbin/
fish_add_path $HOME/bin
#fish_add_path (python3 -c "import os, sys; print(os.path.dirname(sys.executable))")
