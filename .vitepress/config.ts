import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "UWAL",
  description: "Unopinionated WebGPU Abstraction Library",
  // ignoreDeadLinks: true,
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
        items:
        [
          { text: "Device", link: "/Device.md" },
          { text: "Scene", link: "/Scene.md" },
          { text: "Color", link: "/Color.md" },
          {
            text: "Cameras",
            collapsed: true,
            items:
            [{
              text: "Camera2D",
              link: "/Camera2D.md"
            },
            {
              text: "Camera3D",
              link: "/Camera3D.md"
            },
            {
              text: "OrthographicCamera",
              link: "/OrthographicCamera.md"
            },
            {
              text: "PerspectiveCamera",
              link: "/PerspectiveCamera.md"
            }]
          },
          {
            text: "Lights",
            collapsed: true,
            items:
            [{
              text: "Light",
              link: "/Light.md"
            },
            {
              text: "AmbientLight",
              link: "/AmbientLight.md"
            },
            {
              text: "DirectionalLight",
              link: "/DirectionalLight.md"
            },
            {
              text: "PointLight",
              link: "/PointLight.md"
            },
            {
              text: "SpotLight",
              link: "/SpotLight.md"
            }]
          },
          {
            text: "Textures",
            collapsed: true,
            items:
            [{
              text: "TextureUtils",
              link: "/TextureUtils.md"
            },
            {
              text: "Texture",
              link: "/Texture-1.md"
            },
            {
              text: "TEXTURE",
              link: "/TEXTURE.md"
            }]
          },
          { text: "MSDFText", link: "/MSDFText.md" },
          { text: "MathUtils", link: "/MathUtils.md" },
          { text: "Errors", link: "/Errors.md" }
        ]
      }
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Ustym Ukhman"
    }
  }
});
