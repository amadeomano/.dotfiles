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
      graphql = { "treesitter" },
    },
    filter_kind = {
      typescriptreact = false,
      typescript = with_kind(default_ts, "Variable"),
    },
    layout = {
      min_width = { 30, 0.15 },
    },
    keymaps = {
      ["l"] = {
        desc = "Expand the symbol if collapsed, otherwise scroll to it",
        callback = function()
          local bufdata = require("aerial.data").get_or_create(0)
          local item = bufdata:item(vim.api.nvim_win_get_cursor(0)[1])
          if item and bufdata:is_collapsable(item) and bufdata:is_collapsed(item) then
            require("aerial").tree_open()
          else
            require("aerial").select({ jump = false })
          end
        end,
      },
    },
    -- Names the "[ ]" wrapper and its objects for the array-of-objects
    -- aerial rule in after/queries/{tsx,typescript}/aerial.scm: an object is
    -- named by its `id` field, else its first string-valued property, else
    -- left as aerial's default name. Query predicates can't express this
    -- "else" fallback without producing duplicate matches on the same
    -- object, so it's resolved here instead.
    post_parse_symbol = function(bufnr, item, ctx)
      local node = ctx.match.symbol and ctx.match.symbol.node
      if not node then
        return
      end
      if item.kind == "Struct" and node:type() == "array" then
        item.name = "[ ]"
      elseif item.kind == "Field" and node:type() == "object" then
        local id_value, first_string_value
        for child in node:iter_children() do
          if child:named() and child:type() == "pair" then
            local key_node = child:field("key")[1]
            local value_node = child:field("value")[1]
            if key_node and value_node and value_node:type() == "string" then
              local frag = value_node:named_child(0)
              local text = frag and vim.treesitter.get_node_text(frag, bufnr) or nil
              if text then
                if not first_string_value then
                  first_string_value = text
                end
                if not id_value and vim.treesitter.get_node_text(key_node, bufnr) == "id" then
                  id_value = text
                end
              end
            end
          end
        end
        item.name = id_value or first_string_value or item.name
      end
    end,
  },
}
