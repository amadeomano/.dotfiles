# Empty greeting message
set fish_greeting

# set config path
set -x XDG_CONFIG_HOME "$HOME/.config"

# set the full text command for fzf
set -x FZF_DEFAULT_COMMAND 'rg -g "" --hidden --ignore .git'
