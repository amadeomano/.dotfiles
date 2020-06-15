# Dotfiles repo alias
alias dot='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

# Python install shortcut
alias pi='python3 -m pip install --user $@'

# Git related aliases
alias gs='git status'
alias ga='git add $@'
alias gc='git commit $@'
alias gp='git pull'
alias gd='git diff $@'
alias gco='git checkout $@'
alias gb='git branch $@'

# Personio CLI
alias pc='$HOME/personio/perctl'

# Aria2 Downloader
alias down='aria2c -x 16 -c $@'
alias downl='down -i $@'
