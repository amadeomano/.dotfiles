return {
  {
    "sindrets/diffview.nvim",
    cmd = { "DiffviewOpen", "DiffviewFileHistory" },
    keys = {
      { "<leader>ge", "<cmd>DiffviewOpen<cr>", desc = "Git Explorer" },
      { "<leader>gh", "<cmd>DiffviewFileHistory %<cr>", desc = "File History" },
      { "<leader>gH", "<cmd>DiffviewFileHistory<cr>", desc = "Repo History" },
    },
  },
  {
    "pwntester/octo.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-telescope/telescope.nvim",
      "nvim-tree/nvim-web-devicons",
      "sindrets/diffview.nvim",
    },
    cmd = "Octo",
    keys = {
      { "<leader>gp", "<cmd>Octo pr list<cr>", desc = "PR List" },
    },
    opts = {
      picker = "telescope",
      use_local_fs = false,
      enable_builtin = true,
    },
  },
}
