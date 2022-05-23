# Fig pre block. Keep at the top of this file.
. "$HOME/.fig/shell/zshrc.pre.zsh"
### VARS
source $HOME/.zshrc-modules/.vars.zsh

### Plugins
source $HOME/.zshrc-modules/.oh-my-zsh.zsh
source $HOME/.zshrc-modules/.nodenv.zsh

### Aliases
source $HOME/.zshrc-modules/.aliases.zsh

### Functions
source $HOME/.zshrc-modules/.funcs.zsh

### Key bindings
source $HOME/.zshrc-modules/.bindings.zsh

### Run at startup
source $HOME/.zshrc-modules/.startup.zsh

# Fig post block. Keep at the bottom of this file.
. "$HOME/.fig/shell/zshrc.post.zsh"
