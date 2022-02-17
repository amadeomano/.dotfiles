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

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
