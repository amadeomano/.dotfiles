return {
  "folke/snacks.nvim",
  opts = {
    lazygit = {
      env = {
        GIT_CONFIG_COUNT = "1",
        GIT_CONFIG_KEY_0 = "status.showUntrackedFiles",
        GIT_CONFIG_VALUE_0 = "normal",
      },
      config = {
        git = {
          log = { order = "default" },
          paging = {
            colorArg = "always",
            pager = "delta --paging=never",
          },
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
