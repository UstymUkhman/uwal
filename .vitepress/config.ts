import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "UWAL",
  description: "Unopinionated WebGPU Abstraction Library",
  srcDir: ".vitepress",
  base: "/uwal/docs/",
  outDir: "./docs",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "../assets/favicon.svg" }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "../assets/favicon.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "https://ustymukhman.github.io/uwal/dist/examples/examples.html" }
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
        ]
      }
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/UstymUkhman/uwal/" }
    ]
  }
});
