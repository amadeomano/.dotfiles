return {
  "folke/snacks.nvim",
  opts = {
    lazygit = {
      config = {
        git = {
          log = { order = "default" },
          pagers = { pager = "delta --paging=never" },
        },
      },
    },
    picker = {
      previewers = {
        git = { native = true },
      },
    },
  },
}
