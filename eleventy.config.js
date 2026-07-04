import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
  // Syntax highlighting via Prism.js (build-time)
  eleventyConfig.addPlugin(syntaxHighlight);

  // Blog posts in date folders: src/blog/YYYY-MM-DD/*.md
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/**/*.md")
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateCompare = b.date - a.date;
        if (dateCompare !== 0) return dateCompare;
        // Same date: hello-world always first
        if (a.inputPath.includes("hello-world")) return -1;
        if (b.inputPath.includes("hello-world")) return 1;
        // Others: alphabetical
        return a.inputPath.localeCompare(b.inputPath);
      });
  });

  // Static images (not CSS — Tailwind CLI handles that)
  eleventyConfig.addPassthroughCopy("src/img");

  // Date filter for Nunjucks (no extra deps)
  eleventyConfig.addFilter("readableDate", (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Machine-readable date for <time> element
  eleventyConfig.addFilter("machineDate", (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split("T")[0];
  });

  // Filter tags: exclude known layout/internals tags
  eleventyConfig.addFilter("filterTags", (tags) => {
    if (!tags) return [];
    return tags.filter((t) => !["post", "posts", "all"].includes(t));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
