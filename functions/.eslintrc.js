// // module.exports = {
// //   env: {
// //     es6: true,
// //     node: true,
// //   },
// //   parserOptions: {
// //     "ecmaVersion": 2018,
// //   },
// //   extends: [
// //     "eslint:recommended",
// //     "google",
// //   ],
// //   rules: {
// //     "no-restricted-globals": ["error", "name", "length"],
// //     "prefer-arrow-callback": "error",
// //     "quotes": ["error", "double", {"allowTemplateLiterals": true}],
// //   },
// //   overrides: [
// //     {
// //       files: ["**/*.spec.*"],
// //       env: {
// //         mocha: true,
// //       },
// //       rules: {},
// //     },
// //   ],
// //   globals: {},
// // };
// module.exports = {
//   env: {
//     node: true,     // tells ESLint we're running in a Node.js environment
//     es2021: true,
//   },
//   extends: "eslint:recommended",
//   parserOptions: {
//     ecmaVersion: 12,
//     sourceType: "script", // use "script" for CommonJS
//   },
//   rules: {
//     // Add any custom rules here if needed.
//   },
// };
/* eslint-env node */

/* eslint-env node */
module.exports = {
  env: {
    node: true,    // enable Node.js globals
    es2021: true,
    commonjs: true 
  },
  globals: {
    module: "writable",
    require: "writable",
    exports: "writable",
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module", // CommonJS mode
  },
  rules: {
    // your custom rules here, if any
    "no-undef": "off" 
  },
};

