;; extends

; State definitions
(variable_declarator
  name: (array_pattern
    (identifier) @name
    (identifier)
  )
  value: (call_expression
    function: (identifier) @fn-name
  )
(#eq? @fn-name "useState")
(#set! "kind" "Variable")) @symbol

; Single-variable use*() hook calls (useRef, usePageContext, useTable,
; useMemo, useFilterConfig, etc.)
(variable_declarator
  name: (identifier) @name
  value: (call_expression
    function: (identifier) @fn-name
    (#match? @fn-name "^use")
  )
  (#set! "kind" "Variable")) @symbol

; Destructured (object-pattern) use*() hook calls - the hook name becomes
; the parent symbol, each destructured field becomes a child (see also the
; single-variable rule above, and useState's array-pattern rule).
(variable_declarator
  name: (object_pattern)
  value: (call_expression
    function: (identifier) @name
    (#match? @name "^use")
  )
  (#set! "kind" "Function")) @symbol

(variable_declarator
  name: (object_pattern
    (shorthand_property_identifier_pattern) @name @symbol)
  value: (call_expression
    function: (identifier) @fn-name
    (#match? @fn-name "^use")
  )
  (#set! "kind" "Variable"))

; Arrow func definitions
(lexical_declaration
  (variable_declarator
    name: (identifier) @name
    value: (arrow_function)
  )
(#set! "kind" "Function")) @symbol

; useEffects calls
(call_expression
  function: (identifier) @name
(#eq? @name "useEffect")
(#set! "kind" "Function")
) @symbol

; describe("suite name")
(call_expression
  function: (identifier) @fn-name (#eq? @fn-name "describe")
  arguments: (arguments .
    (string (string_fragment) @name))
  (#set! "kind" "Module")) @symbol

; it("test name") / test("test name")
(call_expression
  function: (identifier) @fn-name (#match? @fn-name "^(it|test)$")
  arguments: (arguments .
    (string (string_fragment) @name))
  (#set! "kind" "Function")) @symbol

; Plain constants/variables, at any scope (root-level or inside a function
; body). Excludes arrow/generator function values (handled by the "Arrow
; func definitions" rule) and excludes use*() calls (handled by the use*
; rules added later in this file), so each declaration gets exactly one
; symbol.
(variable_declarator
  name: (identifier) @name
  value: [
    (string)
    (number)
    (true)
    (false)
    (template_string)
    (array)
    (object)
    (identifier)
    (member_expression)
    (unary_expression)
  ]
  (#set! "kind" "Variable")) @symbol

(variable_declarator
  name: (identifier) @name
  value: (call_expression
    function: [(identifier) (member_expression)] @_callee
    (#not-match? @_callee "^use")
  )
  (#set! "kind" "Variable")) @symbol

; The array returned from a function - relabeled to "[ ]" by the
; post_parse_symbol callback in lua/plugins/aerial.lua.
(return_statement
  (array) @name @symbol
  (#set! "kind" "Struct"))

; Each object inside that returned array - named by id, else first
; string-valued property, else left anonymous. Resolved by the same
; post_parse_symbol callback (query predicates can't express an "else"
; fallback without producing duplicate matches on the same object).
(return_statement
  (array
    (object) @name @symbol
    (#set! "kind" "Field")))

; Object properties whose value is an arrow function (e.g. `cell`,
; `accessor`, `format`) - shown as a Property symbol. Anything the arrow
; function's body renders (JSX, further calls, etc.) nests underneath it
; automatically since its range contains the arrow function.
(pair
  key: (property_identifier) @name
  value: (arrow_function)
  (#set! "kind" "Property")) @symbol
