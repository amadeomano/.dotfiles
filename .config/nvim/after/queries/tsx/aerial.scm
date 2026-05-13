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

; Ref definitions
(variable_declarator
  name: (identifier) @name
  value: (call_expression
    function: (identifier) @fn-name
  )
(#eq? @fn-name "useRef")
(#set! "kind" "Variable")) @symbol

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
