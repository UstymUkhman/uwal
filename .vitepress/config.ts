import { defineConfig } from "vitepress";
import Sidebar from "./typedoc-sidebar.json";

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
      { text: "Examples", link: "https://ustymukhman.github.io/uwal/dist/examples/examples.html" },
      { text: "Wiki", link: "https://github.com/UstymUkhman/uwal/wiki" },
      { text: "NPM", link: "https://www.npmjs.com/package/uwal" }
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/UstymUkhman/uwal/" }
    ],

    sidebar: [
      { text: "Introduction", link: "/Introduction" },
      { text: "Installation", link: "/Installation" },
      {
        text: "Modules",
        link: "/Modules",
        items: Sidebar.map((item) => ({
          ...item, link: item.link.replace(".vitepress/", ""),
        }))
      }
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Ustym Ukhman"
    }
  }
});
