# Dotfiles repo alias
alias dot='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

# Python install shortcut
alias pi='python3 -m pip install --user $@'

# Python install shortcut
alias lg='lazygit'

# Git related aliases
alias gs='git status'
alias ga='git add $@'
alias gc='git commit $@'
alias gp='git pull'
alias gd='git diff $@'
alias gco='git checkout $@'
alias gb='git branch $@'

# Personio CLI
alias pc=$(which perctl)
alias mc=~/personio/monolith-cli

# Aria2 Downloader
alias down='aria2c -x 16 -c $@'
alias downl='down -i $@'

# Yarn shortcut
alias y='yarn $@'

# Replace ls wih Exa
alias ls='exa --icons $@'

# Tmux shortcut
alias t='tmux attach -t "ﱦ AM" || tmux new -s "ﱦ AM"'

# Todoist CLI
# Using https://github.com/sachaos/todoist
alias ta='todoist add "$@"'

# Add ssh keys
alias add-ssh='grep -slR "PRIVATE" ~/.ssh/ | xargs ssh-add'
