import { resolve } from "path";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { name, version } from "./package.json";

export default({ mode }) => defineConfig(
{
    build:
    {
        sourcemap: true,

        lib:
        {
            fileName: name,
            name: name.toUpperCase(),
            entry: resolve("lib/UWAL.js")
        }
    },

    plugins:
    [
        glsl(
        {
            root: "/lib/shaders/",
            compress: mode === "production"
        })
    ],

    define:
    {
        VERSION: JSON.stringify(version)
    },

    resolve:
    {
        alias:
        {
            "@": resolve("lib")
        }
    },

    server:
    {
        host: '0.0.0.0',
        open: false,
        port: 8080
    }
});
