[UWAL](Modules.md) / TEXTURE

## Type Aliases

<a id="usage"></a>

### Usage

```ts
type Usage = Readonly<Record<"RENDER" | "STORAGE", GPUTextureUsageFlags>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="address"></a>

### Address

```ts
type Address = Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", GPUAddressMode>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="filter"></a>

### Filter

```ts
type Filter = Readonly<Record<"NEAREST" | "LINEAR", GPUFilterMode>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="compare"></a>

### Compare

```ts
type Compare = 
  | "NEVER"
  | "LESS"
  | "EQUAL"
  | "LESS_EQUAL"
  | "GREATER"
  | "NOT_EQUAL"
  | "GREATER_EQUAL"
  | "ALWAYS";
```

#### Type Parameters

| Type Parameter |
| ------ |

## Variables

<a id="usage-1"></a>

### USAGE

```ts
const USAGE: Readonly<Record<"STORAGE" | "RENDER", number>>;
```

Some utility bitmasks of the `GPUTextureUsage` flags.
- `USAGE.RENDER` is the default usage when creating a texture.
- `USAGE.STORAGE` is the default usage when creating a storage texture.

***

<a id="aspect"></a>

### ASPECT

```ts
const ASPECT: Readonly<Record<"ALL" | "STENCIL" | "DEPTH", GPUTextureAspect>>;
```

Aliases for the `GPUTextureAspect` enum.

***

<a id="address-1"></a>

### ADDRESS

```ts
const ADDRESS: Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", GPUAddressMode>>;
```

Aliases for the `GPUAddressMode` enum.

***

<a id="filter-1"></a>

### FILTER

```ts
const FILTER: Readonly<Record<"NEAREST" | "LINEAR", GPUFilterMode>>;
```

Aliases for the `GPUFilterMode` enum.

***

<a id="compare-1"></a>

### COMPARE

```ts
const COMPARE: Readonly<Record<Compare, GPUCompareFunction>>;
```

Aliases for the `GPUCompareFunction` enum.
