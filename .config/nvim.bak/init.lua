-- Highly inspired by: https://github.com/nvim-lua/kickstart.nvim

local bindings = require('.modules.bindings')
local utils    = require('.modules.utils')

--  NOTE: Must happen before plugins are required (otherwise wrong leader will be used)
bindings.setupLeader()

-- Init Package Manager & Plugins
utils.initPackageManager()
require('modules.plugins')

-- Init Config
require('modules.config')

-- Bind Keymaps
bindings.bindKeyMaps()

