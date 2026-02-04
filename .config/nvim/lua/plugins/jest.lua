return {
  { "nvim-neotest/neotest-jest" },
  {
    "nvim-neotest/neotest",
    opts = function(_, opts)
      -- find the closest project.json upward from the file
      local function find_project_json(startpath)
        local res = vim.fs.find("project.json", {
          upward = true,
          path = startpath,
        })
        return res[1]
      end

      -- read project name from project.json => { "name": "…" }
      local function get_project_name(project_json_path)
        local lines = vim.fn.readfile(project_json_path)
        local decoded = vim.json.decode(table.concat(lines, "\n"))
        return decoded.name
      end

      -- compute test file path relative to project root folder
      local function relative_to_project(file, project_json_path)
        local root = vim.fn.fnamemodify(project_json_path, ":h")
        return file:gsub("^" .. vim.pesc(root .. "/"), "")
      end

      -- build Nx test command
      local function build_nx_command(spec)
        local file = spec.path
        local project_json = find_project_json(file)
        local project_name = get_project_name(project_json)
        local rel_file = relative_to_project(file, project_json)

        local cmd = { "nx", "run", project_name .. ":test", "--", rel_file }

        local name = spec.tree:data().name
        if name then
          table.insert(cmd, "-t")
          table.insert(cmd, name)
        end

        return cmd
      end

      opts.consumers = opts.consumers or {}
      opts.consumers.nx = function()
        return {
          strategy = function(spec)
            return {
              command = build_nx_command(spec),
              cwd = vim.fn.getcwd(),
            }
          end,
        }
      end

      opts.adapters = { "neotest-jest" }

      return opts
    end,
  },
}
