return {
  "stevearc/aerial.nvim",
  opts = {
    backends = {
      ["_"] = { "lsp", "treesitter", "markdown", "man" },
      typescriptreact = { "treesitter" },
    },
    filter_kind = {
      typescriptreact = false,
    },
    layout = {
      min_width = { 30, 0.15 },
    },
  },
}
