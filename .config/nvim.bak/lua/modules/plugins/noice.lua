return {
  'folke/noice.nvim',
  dependencies = {
    'MunifTanjim/nui.nvim', -- ui lib for nvim
    'rcarriga/nvim-notify', -- notification mgr
  },
  config = function ()
    vim.api.nvim_set_hl(0, 'NotifyBackground', { bg='#000000' })

    require('noice').setup({
      ["vim.lsp.util.convert_input_to_markdown_lines"] = true,
      ["vim.lsp.util.stylize_markdown"] = true,
      ["cmp.entry.get_documentation"] = true,
    })
  end
}
