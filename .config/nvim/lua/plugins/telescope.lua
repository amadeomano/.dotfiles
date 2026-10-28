-- Make path relative to cwd, then compact every segment except the
-- filename, e.g. docs/superpowers/plans/blahblah.md -> doc./sup./pla./blahblah.md
local function compact_path(opts, path)
  local Path = require("plenary.path")
  local cwd = opts.cwd and require("telescope.utils").path_expand(opts.cwd) or vim.uv.cwd()
  local relative = Path:new(path):make_relative(cwd)

  local parts = vim.split(relative, "/", { plain = true })
  local filename = parts[#parts]
  for i = 1, #parts - 1 do
    if #parts[i] > 3 then
      parts[i] = parts[i]:sub(1, 3) .. "."
    end
  end
  local display = table.concat(parts, "/")

  local style = {}
  if #parts > 1 then
    -- dim everything up to and including the last "/"; filename keeps the default color
    style = { { { 0, #display - #filename }, "TelescopeResultsComment" } }
  end
  return display, style
end

return {
  "nvim-telescope/telescope.nvim",
  keys = {
    {
      "<leader>gs",
      function() require("config.git-status")() end,
      desc = "Git Status",
    },
  },
  opts = {
    defaults = {
      dynamic_preview_title = true,
      path_display = compact_path,
    },
  },
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
