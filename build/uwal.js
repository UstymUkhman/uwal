var L = Object.defineProperty;
var Q = (s, e, t) => e in s ? L(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var F = (s, e, t) => (Q(s, typeof e != "symbol" ? e + "" : e, t), t), S = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var a = (s, e, t) => (S(s, e, "read from private field"), t ? t.call(s) : e.get(s)), u = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, O = (s, e, t, n) => (S(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t);
var R = (s, e, t) => (S(s, e, "access private method"), t);
function y(s) {
  const e = {};
  for (let t in s)
    e[t] = { value: s[t] };
  return Object.freeze(Object.create(null, e));
}
const W = y(
  {
    DEVICE_LOST: "Device::Lost"
  }
), C = y(
  {
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_NOT_REQUESTED: "DEVICE_NOT_REQUESTED",
    DEVICE_LOST: "DEVICE_LOST",
    CANVAS_NOT_FOUND: "CANVAS_NOT_FOUND",
    CONTEXT_NOT_FOUND: "CONTEXT_NOT_FOUND",
    COMMAND_ENCODER_NOT_FOUND: "COMMAND_ENCODER_NOT_FOUND"
  }
), G = y(
  {
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to get a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to get a GPUDevice.",
    DEVICE_NOT_REQUESTED: "GPUDevice was not requested.",
    DEVICE_LOST: "WebGPU device was lost.",
    CANVAS_NOT_FOUND: "Failed to get a WebGPU canvas.",
    CONTEXT_NOT_FOUND: "Failed to get a WebGPU context.",
    COMMAND_ENCODER_NOT_FOUND: "Failed to get a GPUCommandEncoder."
  }
), X = y(
  {
    WEBGPU_NOT_SUPPORTED: 0,
    ADAPTER_NOT_FOUND: 1,
    DEVICE_NOT_FOUND: 2,
    DEVICE_NOT_REQUESTED: 3,
    DEVICE_LOST: 4,
    CANVAS_NOT_FOUND: 5,
    CONTEXT_NOT_FOUND: 6,
    COMMAND_ENCODER_NOT_FOUND: 7
  }
);
function $(s, e) {
  console.warn(G[s] + (e ?? ""));
}
function d(s, e) {
  throw new Error(G[s] + (e ?? ""), { cause: X[s] });
}
var p, h;
class I {
  /**
   * @param {GPUDevice} [device = undefined]
   * @param {string} [commandEncoderLabel = ""]
   */
  constructor(e, t) {
    /** @type {string} */
    u(this, p, void 0);
    /** @protected @type {GPUDevice} */
    F(this, "Device");
    /** @protected @type {GPUBindGroup[]} */
    F(this, "BindGroups", []);
    /** @type {GPUCommandEncoder | undefined} */
    u(this, h, void 0);
    !e && d(C.DEVICE_NOT_REQUESTED), this.Device = e, O(this, p, t);
  }
  /**
   * @typedef {Object} BufferDescriptor
   * @property {GPUSize64} size
   * @property {GPUBufferUsageFlags} usage
   * @property {string} [label = undefined]
   * @property {boolean} [mappedAtCreation = undefined]
   * @param {BufferDescriptor} descriptor
   */
  CreateBuffer(e) {
    return this.Device.createBuffer(e);
  }
  /**
   * @param {GPUBuffer} buffer
   * @param {BufferSource | SharedArrayBuffer} data
   * @param {GPUSize64} [bufferOffset = 0]
   * @param {GPUSize64} [dataOffset = undefined]
   * @param {GPUSize64} [size = undefined]
   */
  WriteBuffer(e, t, n = 0, i, o) {
    this.Device.queue.writeBuffer(e, n, t, i, o);
  }
  /**
   * @param {GPUBuffer} source
   * @param {GPUBuffer} destination
   * @param {GPUSize64} size
   * @param {GPUSize64} [sourceOffset = 0]
   * @param {GPUSize64} [destinationOffset = 0]
   */
  CopyBufferToBuffer(e, t, n, i = 0, o = 0) {
    this.CommandEncoder.copyBufferToBuffer(e, i, t, o, n);
  }
  /**
   * @param {string | string[]} shader
   * @param {string} [label = ""]
   * @param {any} [sourceMap = undefined]
   * @param {GPUShaderModuleCompilationHint[]} [hints = undefined]
   */
  CreateShaderModule(e, t = "", n, i) {
    const o = Array.isArray(e) ? e.join(`

`) : e;
    return this.Device.createShaderModule({ label: t, code: o, sourceMap: n, compilationHints: i });
  }
  /** @param {GPUBindingResource | GPUBindingResource[]} resources */
  CreateBindGroupEntries(e) {
    return Array.isArray(e) ? e.map((t, n) => ({ binding: n, resource: t })) : [{ binding: 0, resource: e }];
  }
  /**
   * @typedef {Object} BindGroupDescriptor
   * @property {GPUBindGroupLayout} layout
   * @property {Iterable<GPUBindGroupEntry>} entries
   * @property {string} [label = undefined]
   * @param {BindGroupDescriptor} descriptor
   */
  CreateBindGroup(e) {
    return this.Device.createBindGroup(e);
  }
  /** @param {GPUBindGroup | GPUBindGroup[]} bindGroups */
  AddBindGroups(e) {
    this.BindGroups = Array.isArray(e) ? e : [e];
  }
  CreateCommandEncoder() {
    return O(this, h, this.Device.createCommandEncoder({ label: a(this, p) }));
  }
  SubmitCommandBuffer() {
    this.Device.queue.submit([this.CommandEncoder.finish()]);
  }
  /** @protected */
  get CommandEncoder() {
    if (!a(this, h)) {
      const e = ` ${a(this, p) && `Label: "${a(this, p)}". `}`;
      return $(C.COMMAND_ENCODER_NOT_FOUND, e + "Creating a new one."), this.CreateCommandEncoder();
    }
    return a(this, h);
  }
}
p = new WeakMap(), h = new WeakMap();
var g, D;
class j extends I {
  /**
   * @param {GPUDevice} [device = undefined]
   * @param {string} [commandEncoderLabel = ""]
   * @param {GPUTextureFormat} [preferredFormat = undefined]
   */
  constructor(t, n, i) {
    super(t, n);
    /** @type {GPUTextureFormat} */
    u(this, g, void 0);
    /** @type {GPURenderPassEncoder | undefined} */
    u(this, D, void 0);
    O(this, g, i);
  }
  /**
   * @param {GPUTextureView} [view = undefined]
   * @param {GPULoadOp} [loadOp = "load"]
   * @param {GPUStoreOp} [storeOp = "store"]
   * @param {GPUColor} [clearValue = undefined]
   * @param {GPUTextureView} [resolveTarget = undefined]
   * @param {GPUIntegerCoordinate} [depthSlice = undefined]
   */
  CreateColorAttachment(t, n = "load", i = "store", o, c, T) {
    return { view: t, loadOp: n, storeOp: i, clearValue: o, resolveTarget: c, depthSlice: T };
  }
  /**
   * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
   * @param {string} [label = ""]
   * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment = undefined]
   * @param {GPUQuerySet} [occlusionQuerySet = undefined]
   * @param {GPURenderPassTimestampWrites} [timestampWrites = undefined]
   * @param {GPUSize64} [maxDrawCount = undefined]
   */
  CreateRenderPassDescriptor(t, n = "", i, o, c, T) {
    return t = Array.isArray(t) ? t : [t], { colorAttachments: t, label: n, depthStencilAttachment: i, occlusionQuerySet: o, timestampWrites: c, maxDrawCount: T };
  }
  /**
   * @param {GPUShaderModule} module
   * @param {string} [entry = "vertex"]
   * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
   * @param {Iterable<GPUVertexBufferLayout | null>} [buffers = undefined]
   */
  CreateVertexState(t, n = "vertex", i, o) {
    return { module: t, entryPoint: n, constants: i, buffers: o };
  }
  /**
   * @param {GPUShaderModule} module
   * @param {string} [entry = "fragment"]
   * @param {Iterable<GPUColorTargetState | null>} [targets = [undefined]]
   * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
   */
  CreateFragmentState(t, n = "fragment", i, o) {
    return i ?? (i = [{ format: a(this, g) }]), { module: t, entryPoint: n, targets: i, constants: o };
  }
  /**
   * @typedef {Object} RenderPipelineDescriptor
   * @property {GPUVertexState} vertex
   * @property {string} [label = undefined]
   * @property {GPUFragmentState} [fragment = undefined]
   * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
   * @property {GPUPrimitiveState} [primitive = undefined]
   * @property {GPUDepthStencilState} [depthStencil = undefined]
   * @property {GPUMultisampleState} [multisample = undefined]
   * @param {RenderPipelineDescriptor} descriptor
   */
  CreateRenderPipeline(t) {
    const n = t.layout ?? "auto";
    return this.Device.createRenderPipeline({ ...t, layout: n });
  }
  /**
   * @param {GPURenderPassDescriptor} descriptor
   * @param {GPURenderPipeline} pipeline
   * @typedef {Object} DrawParams
   * @property {GPUSize32} vertexCount
   * @property {GPUSize32} [instanceCount = undefined]
   * @property {GPUSize32} [firstVertex = undefined]
   * @property {GPUSize32} [firstInstance = undefined]
   * @param {DrawParams | GPUSize32} drawParams
   * @param {boolean} [submit = true]
   */
  Render(t, n, i, o = !0) {
    if (!a(this, D)) {
      const c = this.CreateCommandEncoder();
      O(this, D, c.beginRenderPass(t)), a(this, D).setPipeline(n);
    }
    for (let c = 0, T = this.BindGroups.length; c < T; ++c)
      a(this, D).setBindGroup(c, this.BindGroups[c]);
    i = typeof i == "number" ? { vertexCount: i } : i, a(this, D).draw(
      i.vertexCount,
      i.instanceCount,
      i.firstVertex,
      i.firstInstance
    ), o && (a(this, D).end(), O(this, D, void 0), this.SubmitCommandBuffer());
  }
  get CurrentPass() {
    return a(this, D);
  }
}
g = new WeakMap(), D = new WeakMap();
var P;
class k extends I {
  /**
   * @param {GPUDevice} [device = undefined]
   * @param {string} [commandEncoderLabel = ""]
   */
  constructor(t, n) {
    super(t, n);
    /** @type {number[]} */
    u(this, P, [1]);
  }
  /**
   * @param {string} [label = ""]
   * @param {GPUQuerySet} [querySet = undefined]
   * @param {GPUSize32} [beginningOfPassWriteIndex = undefined]
   * @param {GPUSize32} [endOfPassWriteIndex = undefined]
   */
  CreateComputePassDescriptor(t = "", n, i, o) {
    return {
      label: t,
      timestampWrites: n ? { querySet: n, beginningOfPassWriteIndex: i, endOfPassWriteIndex: o } : void 0
    };
  }
  /**
   * @typedef {Object} ComputePipelineDescriptor
   * @property {GPUShaderModule} module
   * @property {string} [entry = "compute"]
   * @property {string} [label = undefined]
   * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
   * @property {Record<string, GPUPipelineConstantValue>} [constants = undefined]
   * @param {ComputePipelineDescriptor} descriptor
   */
  CreateComputePipeline(t) {
    const n = t.layout ?? "auto";
    return this.Device.createComputePipeline({ label: t.label, layout: n, compute: t });
  }
  /**
   * @param {GPUComputePipeline} pipeline
   * @param {GPUComputePassDescriptor} [descriptor = undefined]
   */
  Compute(t, n) {
    const i = this.CommandEncoder.beginComputePass(n);
    i.setPipeline(t);
    for (let o = 0, c = this.BindGroups.length; o < c; ++o)
      i.setBindGroup(o, this.BindGroups[o]);
    i.dispatchWorkgroups(...a(this, P)), i.end();
  }
  /** @param {number | number[]} workgroups */
  set Workgroups(t) {
    O(this, P, Array.isArray(t) ? t : [t]);
  }
}
P = new WeakMap();
/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.1
 * @license MIT
 */
var v, N, E, l, A, f, m, U, w, _, M, V, b;
const r = class r {
  /** @param {GPUPowerPreference} [powerPreference = undefined] */
  static SetAdapterOptions(e = void 0, t = !1) {
    a(r, f).powerPreference = e, a(r, f).forceFallbackAdapter = t;
  }
  /**
   * @param {Iterable<GPUFeatureName>} [requiredFeatures = []]
   * @param {Record<string, GPUSize64>} [requiredLimits = {}]
   */
  static SetDeviceDescriptor(e = "", t = [], n = {}) {
    a(r, m).label = e, a(r, m).requiredFeatures = t, a(r, m).requiredLimits = n;
  }
  static SetCanvasSize(e = innerWidth, t = innerHeight) {
    !a(r, E) && d(C.CANVAS_NOT_FOUND), !a(r, N) && d(C.DEVICE_NOT_FOUND);
    const { maxTextureDimension2D: n } = a(r, N).limits;
    e = Math.max(1, Math.min(e, n)), t = Math.max(1, Math.min(t, n)), (a(r, E).width !== e || a(r, E).height !== t) && (a(r, E).height = t, a(r, E).width = e);
  }
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} [commandEncoderLabel = ""]
   * @typedef {Object} ConfigurationOptions
   * @property {GPUTextureFormat} [format = undefined]
   * @property {GPUTextureUsageFlags} [usage = 0x10] - GPUTextureUsage.RENDER_ATTACHMENT
   * @property {Iterable<GPUTextureFormat>} [viewFormats = []]
   * @property {PredefinedColorSpace} [colorSpace = "srgb"]
   * @property {GPUCanvasAlphaMode} [alphaMode = "opaque"]
   * @param {ConfigurationOptions} [options = {}]
   */
  static RenderPipeline(e, t = "", n = {}) {
    return (async () => {
      const i = await r.Device, o = e.getContext("webgpu");
      !o && d(C.CONTEXT_NOT_FOUND);
      const c = n.format ?? a(r, A), T = { ...n, format: c };
      return o.configure({ device: i, ...T }), O(r, E, e), O(r, l, o), new Proxy(
        j,
        {
          construct(x) {
            return new x(i, t, c);
          }
        }
      );
    })();
  }
  /** @param {string} [commandEncoderLabel = ""] */
  static ComputePipeline(e = "") {
    return (async () => {
      const t = await r.Device;
      return new Proxy(
        k,
        {
          construct(n) {
            return new n(t, e);
          }
        }
      );
    })();
  }
  /**
   * @param {GPUBuffer | GPUBuffer[]} [buffers = undefined]
   * @param {GPUTexture | GPUTexture[]} [textures = undefined]
   * @param {GPUQuerySet | GPUQuerySet[]} [querySets = undefined]
   */
  static Destroy(e, t, n) {
    var i, o;
    e = Array.isArray(e) ? e : [e], e.forEach((c) => c == null ? void 0 : c.destroy()), t = Array.isArray(t) ? t : [t], t.forEach((c) => c == null ? void 0 : c.destroy()), n = Array.isArray(n) ? n : [n], n.forEach((c) => c == null ? void 0 : c.destroy()), (i = a(r, l)) == null || i.unconfigure(), (o = a(r, N)) == null || o.destroy();
  }
  static get Adapter() {
    return (async () => {
      var e;
      return a(r, v) ?? await R(e = r, U, w).call(e)();
    })();
  }
  static get Device() {
    return (async () => {
      var e;
      return a(r, N) ?? await R(e = r, _, M).call(e)();
    })();
  }
  /** @returns {HTMLCanvasElement | undefined} */
  static get Canvas() {
    return a(r, E);
  }
  /** @returns {GPUCanvasContext | undefined} */
  static get Context() {
    return a(r, l);
  }
  static get AspectRatio() {
    return !a(r, E) && d(C.CANVAS_NOT_FOUND), a(r, E).width / a(r, E).height;
  }
  static get CurrentTexture() {
    return a(r, l).getCurrentTexture();
  }
  static get CurrentTextureView() {
    return r.CurrentTexture.createView();
  }
  static get VERSION() {
    return "0.0.1";
  }
};
v = new WeakMap(), N = new WeakMap(), E = new WeakMap(), l = new WeakMap(), A = new WeakMap(), f = new WeakMap(), m = new WeakMap(), U = new WeakSet(), w = function() {
  return !navigator.gpu && d(C.WEBGPU_NOT_SUPPORTED), O(r, A, navigator.gpu.getPreferredCanvasFormat()), async () => {
    const e = await navigator.gpu.requestAdapter(a(r, f));
    return !e && d(C.ADAPTER_NOT_FOUND), O(r, v, e);
  };
}, _ = new WeakSet(), M = function() {
  return async () => {
    const { requiredFeatures: e, requiredLimits: t, label: n } = a(r, m), i = await (await r.Adapter).requestDevice({
      requiredFeatures: e,
      requiredLimits: t,
      defaultQueue: { label: n }
    });
    return !i && d(C.DEVICE_NOT_FOUND), i.lost.then(R(r, V, b)), O(r, N, i);
  };
}, V = new WeakSet(), b = function(e) {
  if (r.OnDeviceLost)
    return r.OnDeviceLost(e);
  a(r, E).dispatchEvent(new CustomEvent(W.DEVICE_LOST, { detail: e }));
  const t = (e.message && ` | Message: ${e.message}`) ?? ".";
  d(C.DEVICE_LOST, ` Reason: ${e.reason}` + t);
}, u(r, U), u(r, _), /** @param {GPUDeviceLostInfo} detail */
u(r, V), /** @type {GPUAdapter | null} */
u(r, v, null), /** @type {GPUDevice | null} */
u(r, N, null), /** @type {HTMLCanvasElement} */
u(r, E, void 0), /** @type {GPUCanvasContext} */
u(r, l, void 0), /** @type {GPUTextureFormat} */
u(r, A, void 0), /** @type {GPURequestAdapterOptions} */
u(r, f, {
  powerPreference: void 0,
  forceFallbackAdapter: !1
}), /** @type {GPUDeviceDescriptor} */
u(r, m, {
  label: "",
  requiredFeatures: [],
  requiredLimits: {}
}), /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */
F(r, "OnDeviceLost");
let B = r;
console.info(`%cUWAL v${B.VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
export {
  B as default
};
//# sourceMappingURL=uwal.js.map
