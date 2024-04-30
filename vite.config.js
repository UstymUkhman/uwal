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
            sourcemap: true,
            outDir: "build",
            lib:
            {
                name: name.toUpperCase(),
                entry: resolve("lib/index.js")
            }
        } : {
            outDir: resolve(`dist/${mode}`),
            rollupOptions:
            {
                input:
                {
                    app: resolve(`./${mode}.html`)
                }
            }
        };

    return defineConfig(
    {
        ...config,
        build,

        plugins:
        [
            glsl(
            {
                root: "/lib/shaders/",
                compress: mode !== "development"
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
