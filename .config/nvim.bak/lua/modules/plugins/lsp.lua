local servers = require('modules.plugins.lsp_servers')
local setBindings = require('modules.plugins.lsp_bindings')

local def = {
  'neovim/nvim-lspconfig',
  dependencies = {
    -- Auto installer of LSP servers
    { 'williamboman/mason.nvim', config = true },
    'williamboman/mason-lspconfig.nvim',

    -- Status indicator for LSP
    -- NOTE: `opts = {}` since fidget needs `require('fidget').setup({})`
    { 'j-hui/fidget.nvim', opts = {} },

    -- Lua LSP client with signature support
    'folke/neodev.nvim',
  },
}

def.configure = function(capabilities)
  -- Setup neovim lua configuration
  require('neodev').setup()

  local mason_lspconfig = require 'mason-lspconfig'

  -- Ensure the servers above are installed
  mason_lspconfig.setup {
    ensure_installed = vim.tbl_keys(servers),
  }

  -- Setup client handlers with Autocomp capabilities
  mason_lspconfig.setup_handlers {
    function(server_name)
      require('lspconfig')[server_name].setup {
        capabilities = capabilities,
        on_attach = setBindings,
        settings = servers[server_name],
      }
    end,
  }
end

return def
