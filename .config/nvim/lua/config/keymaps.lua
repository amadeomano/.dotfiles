-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

vim.keymap.set("n", "<leader>o", "<cmd>AerialToggle<CR>")

vim.keymap.set("n", "<leader>ud", function()
  local on_state = {
    spacing = 4,
    source = "if_many", -- shows source only when multiple
    prefix = "●",
  }

  local current = vim.diagnostic.config().virtual_text
  if current == false then
    vim.diagnostic.config({ virtual_text = on_state })
  else
    vim.diagnostic.config({ virtual_text = false })
  end
end, { desc = "Toggle Inline Diagnostics" })
