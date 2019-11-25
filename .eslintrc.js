module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "indent": ["error", 4],
        "import/no-unresolved": [2, { "caseSensitive": false }],
        "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
        "prefer-destructuring": ["error", { "object": false, "array": false }],
        "no-alert": "off",
        "no-undef": "off",
        "no-unused-vars": "off",
        "func-names": "off",
        "no-restricted-globals": "off",
        "no-multi-spaces": [0, {
            "exceptions": {
                "VariableDeclaration": true
            }
        }],
        'no-restricted-syntax': [
          'error',
          'ForInStatement',
        ],
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
