return {
  "akinsho/bufferline.nvim",
  dependencies = {
    {
      "tiagovla/scope.nvim",
      config = true,
    },
  },
  opts = {
    options = {
      sort_by = "insert_after_current",
      auto_toggle_bufferline = false,
    },
  },
  config = function(_, opts)
    require("bufferline").setup(opts)

    local group = vim.api.nvim_create_augroup("BufferlineConditionalVisibility", { clear = true })
    local refresh = function()
      vim.schedule(function()
        local tabpage_count = #vim.api.nvim_list_tabpages()
        local listed_buffer_count = #vim.fn.getbufinfo({ buflisted = 1 })
        vim.o.showtabline = (tabpage_count > 1 or listed_buffer_count > 1) and 2 or 0
        vim.cmd("redrawtabline")
      end)
    end

    vim.api.nvim_create_autocmd({ "BufAdd", "BufDelete", "BufEnter", "TabNew", "TabClosed", "TabEnter" }, {
      group = group,
      callback = refresh,
    })
    refresh()
  end,
}
