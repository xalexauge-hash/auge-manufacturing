module.exports = function(eleventyConfig) {
  
  eleventyConfig.ignores.add("work/**");
  eleventyConfig.ignores.add("_site/**");
  // WICHTIG: Kopiert deine CSS-Dateien und Bilder in den fertigen Ordner
  eleventyConfig.addPassthroughCopy("public");

  return {
    dir: {
      input: ".",      // Wo sind die Quelldateien? (Hier)
      output: "_site"  // Wo soll die fertige Seite hin?
    }
  };
};
