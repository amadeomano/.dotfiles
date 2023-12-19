# My dotfiles

## Install

Adopting the dotfiles all together is feasible with the following steps:

```sh
# 1 create a git alias with preconfigured revision and woking tree dirs
alias dot='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

# 2 prevent bare recursion problems
echo ".dotfiles" >> .gitignore

# 3 bare-clone the repo in the ignored dir
git clone --bare git@github.com:amadeomano/.dotfiles.git $HOME/.dotfiles

# 4 double-check existance of the `dot` alias
alias dot='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

# 5 checkout to the version-controlled working tree
dot checkout

# 6 clean up the `dot status`
dot config --local status.showUntrackedFiles no
```

## Tools

The following tools are being used and configured by my setup

### OS Utilities
- [skhd](https://github.com/koekeishiya/skhd#install)
- [yabai](https://github.com/koekeishiya/yabai#install)
- [SketchyBar](https://github.com/FelixKratz/SketchyBar)

#### SketchyBar dependencies
- [sf-symbols](https://formulae.brew.sh/cask/sf-symbols)
- [jq](https://formulae.brew.sh/formula/jq)
- [gh](https://formulae.brew.sh/formula/gh)

### Terminal Utilities

- [fish](https://formulae.brew.sh/formula/fish#default)
- [fisher](https://github.com/jorgebucaran/fisher)
- [tmux](https://formulae.brew.sh/formula/tmux)
- [tpm](https://github.com/tmux-plugins/tpm)
- [fzf](https://github.com/junegunn/fzf)
- [Lazygit](https://github.com/jesseduffield/lazygit)
- [zoxide](https://github.com/ajeetdsouza/zoxide)
- [fd](https://formulae.brew.sh/formula/fd)
- [gitmux](https://github.com/arl/gitmux)

### Dev tools
- [asdf](https://asdf-vm.com/)

#### Fisher plugins
- [nvm.fish](https://github.com/jorgebucaran/nvm.fish)
- [sdkman-for-fish@v2.0.0](https://github.com/reitzig/sdkman-for-fish)

### Fonts

- `brew tap homebrew/cask-fonts && brew install --cask font-jetbrains-mono-nerd-font`
- `curl -L https://github.com/kvndrsslr/sketchybar-app-font/releases/latest/download/sketchybar-app-font.ttf -o $HOME/Library/Fonts/sketchybar-app-font.ttf`

### Apps

- [Kitty](https://formulae.brew.sh/cask/kitty)
- [Alacritty](https://github.com/alacritty/alacritty#installation)
- [mpv](https://formulae.brew.sh/formula/mpv)
- [neovim](https://formulae.brew.sh/formula/neovim)
- [aria2](https://formulae.brew.sh/formula/aria2)
- [exa](https://the.exa.website/)

### NVIM Plugins

- [vim-plug](https://github.com/junegunn/vim-plug)
- [vim-polyglot](https://github.com/sheerun/vim-polyglot)
- [onedark.vim](https://github.com/joshdick/onedark.vim)
- [fzf.vim](https://github.com/junegunn/fzf.vim)
- [coc.nvim](https://github.com/neoclide/coc.nvim)

### VS Code extensions

- [Better Align](https://marketplace.visualstudio.com/items?itemName=wwm.better-align)
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [file-icons](https://marketplace.visualstudio.com/items?itemName=file-icons.file-icons)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner)
- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)
- [MDX](https://marketplace.visualstudio.com/items?itemName=silvenon.mdx)
- [One Dark Pro](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Vim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim)

### Custom search engines

|  Name  |  Shortcut  |  URL  | 
| :----- | :--------: | :---- | 
| Bundle Phobia | bun | https://bundlephobia.com/result?p=%s | 
| Calendar | cal | https://calendar.google.com/calendar/u/0/r | 
| Confluence | con | https://personio.atlassian.net/wiki/search?text=%s | 
| Jira Board | jir | https://personio.atlassian.net/jira/software/c/projects/DST/boards/288 | 
| DS tickets | ds | https://personio.atlassian.net/issues/?jql=project%20%3D%20%22Design%20System%20Team%22%20and%20summary%20~%20%22%s%22%20order%20by%20created%20DESC | 
| Notepad | txt | data:text/html, <html contenteditable> | 


