# Load modular variables
source $HOME/.config/fish/conf.d/vars.fish

# Load modular aliases
source $HOME/.config/fish/conf.d/aliases.fish

# Load modular functions
source $HOME/.config/fish/conf.d/functions.fish

# Init zoxide
zoxide init fish | source

# Init starship for fish - last line
starship init fish | source
