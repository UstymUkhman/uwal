import { resolve } from "path";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { name, version } from "./package.json";

/** @param {{ mode: string }} */
export default({ mode }) =>
{
    const config = mode !== "lib" && { base: "./" };

    const build = mode === "lib"
        ? {
            outDir: "build",
            lib:
            {
                name: name.toUpperCase(),
                entry: resolve("lib/UWAL.js")
            }
        } : {
            rollupOptions:
            {
                input:
                {
                    app: "./examples.html"
                }
            }
        };

    return defineConfig(
    {
        ...config,

        build:
        {
            ...build,
            sourcemap: true
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
            host: "0.0.0.0",
            open: false,
            port: 8080
        }
    });
};
