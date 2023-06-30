require('lazy').setup({
  -- NOTE: First, some plugins that don't require any configuration

  'tpope/vim-fugitive',                    -- git integration
  'tpope/vim-sleuth',                      -- auto set tabstop & shiftwidth
  'tpope/vim-surround',                    -- CRUD on surrounds
  'folke/which-key.nvim',                  -- show pending keybinds
  'ggandor/leap.nvim',                     -- quick motion

  -- Plugins with options
  require('modules.plugins.lsp'),          -- LSP
  require('modules.plugins.autocomp'),     -- Auto completion
  require('modules.plugins.trouble'),      -- Diagnostics

  require('modules.plugins.onedark'),      -- One Dark theme
  require('modules.plugins.neoscroll'),    -- Smooth scroll

  require('modules.plugins.lualine'),      -- Statusline
  require('modules.plugins.blankline'),    -- Indention guidelines
  require('modules.plugins.noice'),        -- UI for cmd, msg, popup
  require('modules.plugins.gitsigns'),     -- Git editor signs
  require('modules.plugins.tabby'),        -- Tabline

  require('modules.plugins.telescope'),    -- List fuzzy finder
  require('modules.plugins.fzf'),          -- fzf provider for Telescope
  require('modules.plugins.tree'),         -- Tree explorer

  require('modules.plugins.treesitter'),   -- Treesitter
  require('modules.plugins.comment'),      -- Commenter
})

-----------------------------
-- Configure Plugins
-----------------------------
require('leap').add_default_mappings()
require('modules.plugins.telescope').configure()
require('modules.plugins.telescope').bindKeys()

require('modules.plugins.tree').configure()
require('modules.plugins.tree').bindKeys()

local caps = require('modules.plugins.autocomp').configure()
require('modules.plugins.lsp').configure(caps)

require('modules.plugins.treesitter').configure()
