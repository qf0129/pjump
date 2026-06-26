// prettier.config.js
/** @type {import("prettier").Config} */
export default {
  // 每行代码最大长度，超过会换行 [citation:5]
  printWidth: 160,
  // 缩进空格数，2个空格是主流 [citation:5][citation:8]
  tabWidth: 2,
  // 使用空格进行缩进，而不是Tab [citation:5]
  useTabs: false,
  // 语句末尾添加分号 [citation:5]
  semi: true,
  // 使用单引号代替双引号 [citation:5][citation:8]
  singleQuote: true,
  // 多行对象/数组的末尾添加逗号 (适用于ES5及以上的语法) [citation:5][citation:8]
  trailingComma: "es5",
  // 在对象字面量的花括号之间添加空格，如 { foo: bar } [citation:5]
  bracketSpacing: true,
  // JSX 标签的 `>` 是否放在最后一行的末尾，false 表示不放在新的一行 [citation:5]
  jsxBracketSameLine: false,
  // 当箭头函数只有一个参数时，也强制添加括号，如 (x) => x [citation:5]
  arrowParens: "always",
  // 统一换行符为 LF，避免Windows和Mac的git diff冲突。设置为'auto'会跟随系统 [citation:5][citation:9]
  endOfLine: "lf",
};
