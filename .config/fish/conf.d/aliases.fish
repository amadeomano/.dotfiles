
# Dotfiles repo alias
abbr -a dot git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME

# Python install shortcut
abbr -a pi python3 -m pip install --user

# Python install shortcut
abbr -a lg lazygit

# Git related aliases
abbr -a gs git status
abbr -a ga git add
abbr -a gc git commit
abbr -a gp git pull
abbr -a gd git diff
abbr -a gco git checkout
abbr -a gb git branch

# Personio CLI
abbr -a pc perctl
abbr -a mc ~/personio/monolith-cli

# Aria2 Downloader
abbr -a down aria2c -x 16 -c
abbr -a downl down -i

# Yarn shortcut
abbr -a y yarn

# Replace ls to use exa
abbr -a ls exa --icons
abbr -a tree exa --icons --tree

# Tmux shortcut
abbr -a t tmux attach -t "󰘳 AM" || tmux new -s "󰘳 AM"

# Add ssh keys
abbr -a add-ssh grep -slR "PRIVATE" ~/.ssh/ | xargs ssh-add
