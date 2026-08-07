-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

vim.keymap.set("n", "<leader>o", "<cmd>AerialToggle<CR>")

-- Toggle inline Diagnostics
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

-- Clipboard access in neovide
if vim.g.neovide then
  vim.keymap.set("n", "<D-s>", ":w<CR>") -- Save
  vim.keymap.set("v", "<D-c>", '"+y') -- Copy
  vim.keymap.set("n", "<D-v>", '"+P') -- Paste normal mode
  vim.keymap.set("v", "<D-v>", '"+P') -- Paste visual mode
  vim.keymap.set("c", "<D-v>", "<C-R>+") -- Paste command mode
  vim.keymap.set("i", "<D-v>", '<ESC>l"+Pli') -- Paste insert mode

  -- Font size via scale factor
  vim.g.neovide_scale_factor = 1.0
  local scale = function(d) vim.g.neovide_scale_factor = vim.g.neovide_scale_factor * d end

  vim.keymap.set("n", "<D-=>", function() scale(1.1) end, { desc = "Increase font size" })
  vim.keymap.set("n", "<D-->", function() scale(1 / 1.1) end, { desc = "Decrease font size" })
  vim.keymap.set("n", "<D-0>", function() vim.g.neovide_scale_factor = 1.0 end, { desc = "Reset font size" })
end

-- Copy buffer path to clipboard
vim.keymap.set("n", "<leader>cp", function() vim.fn.setreg("+", vim.fn.expand("%:.")) end, { desc = "Copy relative path" })
vim.keymap.set("n", "<leader>cP", function() vim.fn.setreg("+", vim.fn.expand("%:p")) end, { desc = "Copy absolute path" })

-- Copy "@path" or "@path#Lstart-end" mention (like Claude Code's @-mention format) to clipboard
local function copy_claude_mention(absolute, has_range)
  local path = absolute and vim.fn.expand("%:p") or vim.fn.expand("%:.")
  local mention = "@" .. path
  if has_range then
    local start_line = vim.fn.line("'<")
    local end_line = vim.fn.line("'>")
    local range = (start_line == end_line) and ("L" .. start_line) or ("L" .. start_line .. "-" .. end_line)
    mention = mention .. "#" .. range
  end
  vim.fn.setreg("+", mention)
  vim.notify("Copied " .. mention)
end

vim.keymap.set("n", "<leader>ap", function() copy_claude_mention(false, false) end, { desc = "Copy @relative/path" })
vim.keymap.set("v", "<leader>ap", function() copy_claude_mention(false, true) end, { desc = "Copy @relative/path#Lrange" })
vim.keymap.set("n", "<leader>aP", function() copy_claude_mention(true, false) end, { desc = "Copy @absolute/path" })
vim.keymap.set("v", "<leader>aP", function() copy_claude_mention(true, true) end, { desc = "Copy @absolute/path#Lrange" })

-- Allow clipboard copy paste in neovim
vim.api.nvim_set_keymap("", "<D-v>", "+p<CR>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("!", "<D-v>", "<C-R>+", { noremap = true, silent = true })
vim.api.nvim_set_keymap("t", "<D-v>", "<C-R>+", { noremap = true, silent = true })
vim.api.nvim_set_keymap("v", "<D-v>", "<C-R>+", { noremap = true, silent = true })

-- BufferLine tab reordering
vim.keymap.set("n", "<A-H>", "<cmd>BufferLineMovePrev<CR>", { desc = "Move buffer left" })
vim.keymap.set("n", "<A-L>", "<cmd>BufferLineMoveNext<CR>", { desc = "Move buffer right" })
