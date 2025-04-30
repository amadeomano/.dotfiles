local def = {
  'nvim-treesitter/nvim-treesitter',
  dependencies = {
    'nvim-treesitter/nvim-treesitter-textobjects',
    'nvim-treesitter/playground',
    'windwp/nvim-ts-autotag',
  },
  build = ":TSUpdate",
}

def.configure = function()
  -- Enable folding with treesitter
  vim.o.foldmethod = "expr"
  vim.o.foldexpr = "nvim_treesitter#foldexpr()"
  vim.o.foldlevelstart = 99 -- disable folding at startup

  require('nvim-treesitter.configs').setup {
    -- Languages to be installed automattically
    ensure_installed = { 'lua', 'tsx', 'typescript' },

    -- Disable autoinstall missing langs
    auto_install = false,

    -- Enable nvim-ts-autotag
    autotag = { enable = true },

    highlight = { enable = true },
    indent = { enable = true, disable = { 'python' } },
    incremental_selection = {
      enable = true,
      keymaps = {
        init_selection = '<C-space>',
        node_incremental = '<C-space>',
        scope_incremental = '<C-s>',
        node_decremental = '<M-space>',
      },
    },
    textobjects = {
      select = {
        enable = true,
        lookahead = true, -- Automatically jump forward to textobj, similar to targets.vim
        keymaps = {
          -- You can use the capture groups defined in textobjects.scm
          ['aa'] = '@parameter.outer',
          ['ia'] = '@parameter.inner',
          ['af'] = '@function.outer',
          ['if'] = '@function.inner',
          ['ac'] = '@class.outer',
          ['ic'] = '@class.inner',
        },
      },
      move = {
        enable = true,
        set_jumps = true, -- whether to set jumps in the jumplist
        goto_next_start = {
          [']m'] = '@function.outer',
        },
        goto_next_end = {
          [']M'] = '@function.outer',
        },
        goto_previous_start = {
          ['[m'] = '@function.outer',
        },
        goto_previous_end = {
          ['[M'] = '@function.outer',
        },
      },
      swap = {
        enable = true,
        swap_next = {
          ['<leader>a'] = '@parameter.inner',
        },
        swap_previous = {
          ['<leader>A'] = '@parameter.inner',
        },
      },
    },
  }
end

return def
