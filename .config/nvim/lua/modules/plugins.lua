require('lazy').setup({
  -- NOTE: First, some plugins that don't require any configuration

  'tpope/vim-sleuth',                      -- auto set tabstop & shiftwidth
  'tpope/vim-surround',                    -- CRUD on surrounds
  'folke/which-key.nvim',                  -- Show pending keybinds

  -- Plugins with options
  require('modules.plugins.lsp'),          -- LSP
  require('modules.plugins.autocomp'),     -- Auto completion
  require('modules.plugins.trouble'),      -- Diagnostics

  require('modules.plugins.onedark'),      -- One Dark theme

  require('modules.plugins.lualine'),      -- Statusline
  require('modules.plugins.blankline'),    -- Indention guidelines

  require('modules.plugins.telescope'),    -- List fuzzy finder
  require('modules.plugins.fzf'),          -- fzf provider for Telescope

  require('modules.plugins.treesitter'),   -- Treesitter
})

-----------------------------
-- Configure Plugins
-----------------------------
require('modules.plugins.telescope').configure()
require('modules.plugins.telescope').bindKeys()

local caps = require('modules.plugins.autocomp').configure()
require('modules.plugins.lsp').configure(caps)

require('modules.plugins.treesitter').configure()
