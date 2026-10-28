# Load modular variables
source $HOME/.config/fish/conf.d/vars.fish

# Load modular aliases
source $HOME/.config/fish/conf.d/aliases.fish

# Load modular functions
source $HOME/.config/fish/conf.d/functions.fish

# load asdf runtime manager
set -gx PATH $HOME/.asdf/shims /opt/homebrew/bin $PATH

# Init zoxide
zoxide init fish | source

# Init starship for fish - last line
starship init fish | source

# Init pnpm global bin
set -Ux PNPM_HOME "$HOME/Library/pnpm"
fish_add_path $PNPM_HOME

# Added by Obsidian
fish_add_path /Applications/Obsidian.app/Contents/MacOS

# tabtab source for packages
# uninstall by removing these lines
[ -f ~/.config/tabtab/fish/__tabtab.fish ]; and . ~/.config/tabtab/fish/__tabtab.fish; or true
