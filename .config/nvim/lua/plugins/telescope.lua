return {
  "nvim-telescope/telescope.nvim",
  opts = { defaults = { dynamic_preview_title = true } },
  config = function(_, opts)
    require("telescope").setup(opts)
    local P = require("telescope.previewers.previewer")
    local orig = P.title
    P.title = function(self, entry, dynamic)
      local t = orig(self, entry, dynamic)
      return t and vim.fn.fnamemodify(t, ":t") or t
    end
  end,
}
