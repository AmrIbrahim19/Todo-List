module.exports = {
  extends: [
    "plugin:prettier/recommended",
    "prettier",
    "react-app",
    "react-app/jest",
  ],
  "rules": {
    "prettier/prettier": ["error",{
      "endOfLine": "auto"}
    ]

  }
};
