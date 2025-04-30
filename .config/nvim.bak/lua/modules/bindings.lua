local M = {}

-- Set <space> as the leader key
function M.setupLeader()
  vim.g.mapleader = ' '
  vim.g.maplocalleader = ' '
end

function M.bindKeyMaps()
  -- No nav with space
  vim.keymap.set({ 'n', 'v' }, '<Space>', '<Nop>', { silent = true })

  -- G+JK in case of wordwrap
  vim.keymap.set('n', 'k', "v:count == 0 ? 'gk' : 'k'", { expr = true, silent = true })
  vim.keymap.set('n', 'j', "v:count == 0 ? 'gj' : 'j'", { expr = true, silent = true })

  -- Remap only for certain files
  vim.api.nvim_create_autocmd("BufEnter", {
    pattern = {'*.tsx'},
    callback = function ()
      vim.keymap.set('n', '}', ":call search('{\\|}')<CR>",      { silent = true })
      vim.keymap.set('n', '{', ":call search('{\\|}', 'b')<CR>", { silent = true })
    end,
  })

end

return M
