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

# pnpm
export PNPM_HOME="/Users/ahmad.manouchehri/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
# pnpm end
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"

. /opt/homebrew/opt/asdf/libexec/asdf.sh

# Configure Colima as Docker Host for applications which don't respect Docker Contexts
export DOCKER_HOST=unix://${HOME}/.colima/default/docker.sock

# Testcontainers should use the default Docker Socket
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
