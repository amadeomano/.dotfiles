return {
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        graphql = { "prettier" }, -- prettier for graphql formatting
        markdown = { "prettier" }, -- prettier for graphql formatting
      },
      formatters = {
        prettier = {
          options = {
            ext_parsers = {
              query = "graphql", -- graphql parser for .query files
            },
          },
        },
      },
    },
  },
}
