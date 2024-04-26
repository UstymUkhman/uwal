declare module "*/uwal.js"
{
    import UWAL from "@/UWAL";
    export default UWAL;
}

declare module "*.wgsl"
{
    const shader: string;
    export default shader;
}

declare module "*.wgsl?raw"
{
    const shader: string;
    export default shader;
}

declare const VERSION: string;
