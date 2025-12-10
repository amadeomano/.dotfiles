return {
  "saghen/blink.cmp",
  opts = {
    keymap = {
      preset = "default",

      ["<S-Tab>"] = { "select_prev", "fallback" },
      ["<Tab>"] = { "select_next", "fallback" },
      ["<CR>"] = { "select_and_accept", "fallback" },
      ["<Esc>"] = { "cancel", "fallback" },
    },
  },
}
