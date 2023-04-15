local M = {}

-----------------------------------------
-- Install package manager
-----------------------------------------
function M.initPackageManager()
  --    https://github.com/folke/lazy.nvim
  --    Docs: `:help lazy.nvim.txt`
  local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
  if not vim.loop.fs_stat(lazypath) then
    vim.fn.system {
      'git',
      'clone',
      '--filter=blob:none',
      'https://github.com/folke/lazy.nvim.git',
      '--branch=stable', -- latest stable release
      lazypath,
    }
  end
  vim.opt.rtp:prepend(lazypath)
end

return M
