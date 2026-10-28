return {
  "neovim/nvim-lspconfig",
  opts = {
    diagnostics = {
      virtual_text = false, -- disable inline text
    },
    inlay_hints = {
      enabled = false,
    },
    servers = {
      tsserver = { enabled = false },
      -- `vtsls` needs the legacy tsserver API. TS 7's native server is
      -- exposed by the workspace `tsc --lsp` command instead.
      vtsls = { enabled = false },
      tsc = { enabled = true },
      tailwindcss = { enabled = false },
      sourcekit = {
        mason = false,
      },
    },
  },
}
