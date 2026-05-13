;; extends

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
