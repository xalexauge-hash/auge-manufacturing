module.exports = function(eleventyConfig) {
  
  // WICHTIG: Kopiert deine CSS-Dateien und Bilder in den fertigen Ordner
  eleventyConfig.addPassthroughCopy("public");

  return {
    dir: {
      input: ".",      // Wo sind die Quelldateien? (Hier)
      output: "_site"  // Wo soll die fertige Seite hin?
    }
  };
};