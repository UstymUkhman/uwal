import { name, version } from "./package.json";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { resolve } from "path";

export default({ mode }) =>
{
    const config = mode !== "lib" && { base: "./" };

    const plugins = mode === "lib" &&
    [
        terser(
        {
            ecma: 2020,
            module: true,
            compress: {
                passes: 4,
                ecma: 2020,
                unsafe: true,
                unsafe_arrows: true,
                unsafe_comps: false,
                unsafe_Function: true,
                unsafe_math: true,
                unsafe_symbols: false,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true
            }
        })
    ];

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
        build,
        ...config,

        plugins:
        [
            ...plugins,
            glsl(
            {
                root: "/lib/shaders/",
                defaultExtension: "wgsl",
                minify: mode !== "development"
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
                "#": resolve("lib")
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
