return {
  'jose-elias-alvarez/null-ls.nvim',
  config = function()
    local null_ls = require("null-ls")
    local augroup = vim.api.nvim_create_augroup("LspFormatting", {})

    null_ls.setup({
      debug = false,
      sources = {
        null_ls.builtins.formatting.eslint_d,
        null_ls.builtins.diagnostics.eslint_d,
        null_ls.builtins.code_actions.eslint_d,
      },

      -- Function for formatting on save
      on_attach = function(client, bufnr)
        if client.supports_method("textDocument/formatting") then
          vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })
          vim.api.nvim_create_autocmd("BufWritePre", {
            group = augroup,
            buffer = bufnr,
            callback = function()
              vim.lsp.buf.format({
                -- format only with the null_ls client
                filter = function(cl)
                  return cl.name == "null-ls"
                end,
                async = false
              })
            end,
          })
        end
      end,
    })
  end
}
