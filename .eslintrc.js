module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "indent": ["error", 4],
        "import/no-unresolved": [2, { "caseSensitive": false }],
        "prefer-destructuring": ["error", { "object": false, "array": false }],
        "no-alert": "off",
        "no-undef": "off",
        "no-unused-vars": "off",
    },
    "globals": {
        "document": true,
        "window": true,
    },
    "env": {
        "browser": true,
        "node": true
    },
}