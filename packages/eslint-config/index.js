module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["dist", ".turbo", "node_modules"],
    env: {
        node: true,
        es2016: true
    }
};
