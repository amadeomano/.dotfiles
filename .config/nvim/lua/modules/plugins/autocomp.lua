local setBindings = require('modules.plugins.autocomp_bindings')

local def = {
  'hrsh7th/nvim-cmp',
  dependencies = {
    'hrsh7th/cmp-nvim-lsp',      -- Additional LS client capabilities
    'L3MON4D3/LuaSnip',          -- Snippet engine
    'saadparwaiz1/cmp_luasnip'   -- Completion source integration with LuaSnip
  },
}

local setup = function()
  local cmp = require 'cmp'
  local luasnip = require 'luasnip'

  luasnip.config.setup {}

  cmp.setup {
    snippet = { expand = function(args) luasnip.lsp_expand(args.body) end },
    mapping = cmp.mapping.preset.insert(setBindings(cmp, luasnip)),
    sources = {
      { name = 'nvim_lsp' },
      { name = 'luasnip' },
    }
  }
end

def.configure = function()
  -- override nvim built-in LS client capabilities
  local capabilities = vim.lsp.protocol.make_client_capabilities()
  capabilities = require('cmp_nvim_lsp').default_capabilities(capabilities)

  setup()
  return capabilities
end

return def
