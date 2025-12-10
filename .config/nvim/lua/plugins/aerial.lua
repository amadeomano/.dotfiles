local default_ts = {
  "Class",
  "Constructor",
  "Enum",
  "Field",
  "Function",
  "Interface",
  "Method",
  "Module",
  "Namespace",
  "Package",
  "Property",
  "Struct",
  "Trait",
}

local function with_kind(base, ...)
  local result = {}
  vim.list_extend(result, base)
  vim.list_extend(result, { ... })
  return result
end

return {
  "stevearc/aerial.nvim",
  opts = {
    backends = {
      ["_"] = { "lsp", "treesitter", "markdown", "man" },
      typescriptreact = { "treesitter" },
    },
    filter_kind = {
      typescriptreact = false,
      typescript = with_kind(default_ts, "Variable"),
    },
    layout = {
      min_width = { 30, 0.15 },
    },
  },
}
