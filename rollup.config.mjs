export default [
  {
    input: "background/background.js",
    output: {
      file: "background.js",
      format: "es",
    },
    treeshake: false,
  },
  {
    input: "content/content.js",
    output: {
      file: "content.js",
      format: "es",
    },
    treeshake: false,
  },
];
