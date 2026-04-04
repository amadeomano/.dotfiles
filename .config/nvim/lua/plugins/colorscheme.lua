return {
  "folke/tokyonight.nvim",
  opts = function()
    local transparent = not vim.g.neovide
    return {
      transparent = transparent,
      styles = {
        sidebars = transparent and "transparent" or "normal",
        floats = transparent and "transparent" or "normal",
      },
    }
  end,
}
