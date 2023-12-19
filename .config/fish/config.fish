# Load modular variables
source $HOME/.config/fish/conf.d/vars.fish

# Load modular aliases
source $HOME/.config/fish/conf.d/aliases.fish

# Load modular functions
source $HOME/.config/fish/conf.d/functions.fish

# load asdf runtime manager
source $HOME/.asdf/asdf.fish

# Init zoxide
zoxide init fish | source

# Init starship for fish - last line
starship init fish | source

# tabtab source for packages
# uninstall by removing these lines
[ -f ~/.config/tabtab/fish/__tabtab.fish ]; and . ~/.config/tabtab/fish/__tabtab.fish; or true
