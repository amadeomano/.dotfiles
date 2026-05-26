function dot -d "git wrapper for dot files"
    git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME $argv
end

function lgdot -d "lazygit wrapper for dot files"
    set -lx GIT_DIR $HOME/.dotfiles
    set -lx GIT_WORK_TREE $HOME
    lazygit $argv
end

function claudio -d "Personal claude!"
    set -lx CLAUDE_CONFIG_DIR $HOME/.config/claude-personal
    echo -ne "\033]0;⟁ \007"
    set -lx CLAUDE_CODE_DISABLE_TERMINAL_TITLE 1
    claude $argv
end

function code -d "Neovide wrapper"
    neovide --fork $argv
end

function sub -d "SublimeText wrapper"
    /Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl --args (pwd)/$argv
end

function en -d "Translate english word"
    curl 'https://fastdic.com/suggestions' \
        -H 'content-type: application/json' \
        -H 'referer: https://fastdic.com/' \
        --data-raw "{\"word\":\"$argv\"}" | jq
end

function de -d "Translate german word"
    curl "https://api.wort.ir/api/vocab/details/de?slug=/woerterbuch/deutsch-persisch/$argv" \
        | jq '.meta'
end

function rgg
    set -l RG_PREFIX "rg --column --line-number --no-heading --color=always --smart-case"
    set -l query (string join " " $argv)
    set -l result (fzf \
      --bind "start:reload:$RG_PREFIX {q}" \
      --bind "change:reload:sleep 0.1; $RG_PREFIX {q} || true" \
      --ansi \
      --delimiter : \
      --preview 'bat --color=always {1} --highlight-line {2}' \
      --preview-window 'up,60%,border-bottom,+{2}+3/3,~3' \
      --query $query)
    if test -n "$result"
        set -l parts (string split -m 3 : $result)
        nvim +"$parts[2]" "$parts[1]"
    end
end
