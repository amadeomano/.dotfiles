return {
  "mfussenegger/nvim-lint",
  opts = {
    linters = {
      -- Always use the config shipped with this nvim config, regardless of cwd.
      ["markdownlint-cli2"] = {
        args = { "--config", vim.fn.stdpath("config") .. "/.markdownlint-cli2.jsonc", "-" },
      },
    },
  },
}
