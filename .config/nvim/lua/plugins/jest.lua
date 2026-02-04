return {
  { "nvim-neotest/neotest-jest" },
  {
    "nvim-neotest/neotest",
    opts = {
      discovery = { enabled = false },
      adapters = {
        ["neotest-jest"] = {
          jestCommand = function(path)
            -- npx --no-install jest {path}
            return "npx --no-install jest " .. path
          end,

          jestConfigFile = function(file)
            -- find the closest jest.config.ts upward from the file
            local function find_jest_config(startpath)
              local res = vim.fs.find("jest.config.ts", { upward = true, path = startpath })
              return res[1]
            end
            local jest_config = find_jest_config(file)
            if not jest_config then
              return vim.fn.getcwd() .. "/jest.config.ts"
            end
            return jest_config
          end,

          cwd = function(file)
            -- vim.notify(file)
            return vim.fn.getcwd()
          end,
        },
      },
    },
  },
}
