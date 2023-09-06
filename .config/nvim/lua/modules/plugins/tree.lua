local def = {
  'nvim-tree/nvim-tree.lua',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
}

def.configure = function ()
  vim.g.loaded_netrw = 1
  vim.g.loaded_netrwPlugin = 1
  require("nvim-tree").setup()
end

def.bindKeys = function ()
  local tree = require('nvim-tree.view')

  vim.keymap.set('n', '<C-F>', function()
    if tree.is_visible() then
      tree.focus()
    else
      tree.close()
    end
  end, { silent = true })
end

return def
