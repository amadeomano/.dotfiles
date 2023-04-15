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

### Terminal Utilities

- [zsh](https://formulae.brew.sh/formula/zsh)
- [ohmyzsh](https://github.com/ohmyzsh/ohmyzsh#custom-directory)
- [nodenv](https://formulae.brew.sh/formula/nodenv)
- [tmux](https://formulae.brew.sh/formula/tmux)
- [powerline](https://powerline.readthedocs.io/en/latest/installation.html#pip-installation)
- [powerlevel10k](https://github.com/romkatv/powerlevel10k#oh-my-zsh)
- [fzf](https://github.com/junegunn/fzf)

### Fonts

- `brew tap homebrew/cask-fonts && brew install --cask font-jetbrains-mono-nerd-font`

### Apps

- [Kitty](https://formulae.brew.sh/cask/kitty)
- [Alacritty](https://github.com/alacritty/alacritty#installation)
- [mpv](https://formulae.brew.sh/formula/mpv)
- [neovim](https://formulae.brew.sh/formula/neovim)
- [aria2](https://formulae.brew.sh/formula/aria2)
- [logo-ls](https://github.com/Yash-Handa/logo-ls#macos-darwin)

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
