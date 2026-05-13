-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
vim.filetype.add({
  extension = {
    query = "graphql",
    mutation = "graphql",
    mdx = "markdown",
  },
})

vim.opt.shell = "/opt/homebrew/bin/fish"

vim.o.guifont = "Victor Mono:h14"

-- Neovide related
vim.g.neovide_input_macos_option_key_is_meta = "both"
vim.g.neovide_padding_top = 0
vim.g.neovide_padding_bottom = 0
vim.g.neovide_padding_right = 0
vim.g.neovide_padding_left = 0
