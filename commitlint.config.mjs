const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [0],
  },
};

export default config;
