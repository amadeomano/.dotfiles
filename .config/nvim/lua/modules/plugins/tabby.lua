local theme = {
  fill = 'TabLineFill',
  head = 'TabLine',
  current_tab = 'TabLineSel',
  tab = 'TabLine',
  win = 'TabLine',
  tail = 'TabLine',
}

local renderLine = function(line)
  return {
    line.tabs().foreach(function(tab)
      local hl = tab.is_current() and theme.current_tab or theme.tab
      local ext = string.match(tab.name(), '[.](%w*)') or ""
      return {
        line.sep('', hl, theme.fill),
        require'nvim-web-devicons'.get_icon(tab.name(), ext, { default = true }),
        tab.number(),
        tab.name(),
        tab.close_btn(tab.is_current() and '󰅙' or '󰅚'),
        line.sep('', hl, theme.fill),
        hl = hl,
        margin = ' ',
      }
    end),
    line.spacer(),
    line.wins_in_tab(line.api.get_current_tab()).foreach(function(win)
      return {
        ' ',
        win.is_current() and '' or '',
        win.buf_name(),
        hl = theme.win,
        margin = ' ',
      }
    end),
    {
      line.sep('', theme.tail, theme.fill),
      { '  ', hl = theme.tail },
    },
    hl = theme.fill,
  }
end

return {
  'nanozuki/tabby.nvim',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  config = function()
    vim.o.showtabline = 2
    require('tabby.tabline').set(renderLine)
  end
}
