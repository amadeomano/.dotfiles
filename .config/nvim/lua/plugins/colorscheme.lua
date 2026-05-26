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
      on_highlights = function(hl, c)
        -- Fixes the gap between the border and the text
        hl.BufferLineIndicatorSelected = { fg = hl.BufferLineIndicatorSelected.fg, bg = c.bg }
      end,
    }
  end,
}
