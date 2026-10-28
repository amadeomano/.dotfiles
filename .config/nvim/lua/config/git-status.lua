-- Keep Git's cached, directory-grouped untracked scan: neither -uall nor a pathspec.
return function(opts)
  opts = vim.deepcopy(opts or {})
  local result = vim.system({ "git", "rev-parse", "--show-toplevel" }, {
    cwd = opts.cwd or vim.uv.cwd(),
    text = true,
  }):wait()
  if result.code ~= 0 then
    vim.notify("Git Status: " .. vim.trim(result.stderr or "Not in a Git repository"), vim.log.levels.ERROR)
    return
  end
  opts.cwd = vim.trim(result.stdout)

  local actions = require("telescope.actions")
  local state = require("telescope.actions.state")
  local finders = require("telescope.finders")
  local conf = require("telescope.config").values

  local function finder()
    local make_entry = require("telescope.make_entry").gen_from_git_status(opts)
    local skip_source = false
    return finders.new_oneshot_job({
      "git", "status", "--porcelain=v1", "-z", "--untracked-files=normal",
    }, {
      cwd = opts.cwd,
      split_char = "\0",
      entry_maker = function(record)
        -- In -z output a rename/copy has a second record containing its source path.
        if skip_source then
          skip_source = false
          return nil
        end
        skip_source = record:sub(1, 2):find("[RC]") ~= nil
        return make_entry(record)
      end,
    })
  end

  require("telescope.pickers").new(opts, {
    prompt_title = "Git Status",
    finder = finder(),
    previewer = require("telescope.previewers").git_file_diff.new(opts),
    sorter = conf.file_sorter(opts),
    attach_mappings = function(prompt_bufnr, map)
      actions.select_default:replace_if(function()
        local entry = state.get_selected_entry()
        return entry ~= nil and vim.fn.isdirectory(entry.path) == 1
      end, function()
        local entry = state.get_selected_entry()
        actions.close(prompt_bufnr)
        require("mini.files").open(entry.path)
      end)
      map({ "i", "n" }, "<Tab>", function()
        if not state.get_selected_entry() then
          return
        end
        actions.git_staging_toggle(prompt_bufnr)
        state.get_current_picker(prompt_bufnr):refresh(finder(), { reset_prompt = false })
      end)
      return true
    end,
  }):find()
end
