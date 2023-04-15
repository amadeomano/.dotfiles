return {
  'navarasu/onedark.nvim',
  priority = 1000,
  config = function()
    vim.cmd.colorscheme 'onedark'
    local onedark = require('onedark')

    onedark.setup {
      style = 'deep',
      transparent = true,
    }
    onedark.load()
  end,
}
