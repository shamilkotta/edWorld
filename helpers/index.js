const { create } = require("express-handlebars");

module.exports = {
  compileHTMLEmailTemplate: (HTMLTemplatePath, replacements = {}) =>
    new Promise((resolve) => {
      const compiledHTML = create().render(HTMLTemplatePath, replacements);
      resolve(compiledHTML);
    }),
};
