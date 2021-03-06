# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# oh-my-zsh theme
ZSH_THEME="powerlevel10k/powerlevel10k"

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# Space separated plugins
plugins=(
  git
  zsh-autosuggestions
  docker
  docker-compose
)

# Load oh-my-zsh
source $ZSH/oh-my-zsh.sh

# Load zsh-syntax-highlighting
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Load fzf fuzzy search app plugin
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
