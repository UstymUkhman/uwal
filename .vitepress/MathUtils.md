[UWAL](Modules.md) / MathUtils

## Description

A set of mathematical objects and functions for general-purpose usage.
[Type Aliases](#type-aliases) are [namespaces](https://wgpu-matrix.org/docs/modules.html) and [utils](https://wgpu-matrix.org/docs/modules/utils.html)
re-exported from [wgpu-matrix](https://github.com/greggman/wgpu-matrix), so their original documentation is completely relevant for this module.

## Type Aliases

<a id="euclideanmodulo"></a>

### EuclideanModulo

```ts
type EuclideanModulo = utils.euclideanModulo;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="degreestoradians"></a>

### DegreesToRadians

```ts
type DegreesToRadians = utils.degToRad;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="radianstodegrees"></a>

### RadiansToDegrees

```ts
type RadiansToDegrees = utils.radToDeg;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="inverselerp"></a>

### InverseLerp

```ts
type InverseLerp = utils.inverseLerp;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="setepsilon"></a>

### SetEpsilon

```ts
type SetEpsilon = utils.setEpsilon;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="epsilon"></a>

### EPSILON

```ts
type EPSILON = utils.EPSILON;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="lerp"></a>

### Lerp

```ts
type Lerp = utils.lerp;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="quat"></a>

### Quat

```ts
type Quat = quat;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="mat3"></a>

### Mat3

```ts
type Mat3 = mat3;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="mat4"></a>

### Mat4

```ts
type Mat4 = mat4;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="vec2"></a>

### Vec2

```ts
type Vec2 = vec2;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="vec3"></a>

### Vec3

```ts
type Vec3 = vec3;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="vec4"></a>

### Vec4

```ts
type Vec4 = vec4;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Variables

<a id="hpi"></a>

### HPI

```ts
const HPI: number;
```

Half PI, defined as `Math.PI / 2`.

***

<a id="tau"></a>

### TAU

```ts
const TAU: number;
```

Double PI, defined as `Math.PI * 2`.

## Functions

<a id="clamp"></a>

### Clamp()

```ts
function Clamp(
   value, 
   min?, 
   max?): number;
```

Constrain a number between `min` and `max` values (inclusive).

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | Number to clamp |
| `min?` | `number` | `0` | Lower limit |
| `max?` | `number` | `1` | Upper limit |

#### Returns

`number`

***

<a id="random"></a>

### Random()

```ts
function Random(min?, max?): number;
```

Get a pseudorandom float between `min` (inclusive) and `max` (exclusive).

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `min?` | `number` | `0` | Lower limit |
| `max?` | `number` | `1` | Upper limit |

#### Returns

`number`

***

<a id="randomint"></a>

### RandomInt()

```ts
function RandomInt(min, max): number;
```

Get a pseudorandom integer between `min` (inclusive) and `max` (exclusive).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `min` | `number` | Lower limit |
| `max` | `number` | Upper limit |

#### Returns

`number`

***

<a id="smoothstep"></a>

### SmoothStep()

```ts
function SmoothStep(
   value, 
   min?, 
   max?): number;
```

Perform Hermite interpolation between two values.
Adapted from GLSL's [smoothstep](https://registry.khronos.org/OpenGL-Refpages/gl4/html/smoothstep.xhtml) function.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | Value to interpolate |
| `min?` | `number` | `0` | Lower limit |
| `max?` | `number` | `1` | Upper limit |

#### Returns

`number`

***

<a id="smootherstep"></a>

### SmootherStep()

```ts
function SmootherStep(
   value, 
   min?, 
   max?): number;
```

A variation on the [SmoothStep](#smoothstep) function that has zero 1st and 2nd order derivatives at `x = 0` and `x = 1`.
Adapted from three.js' [smootherstep](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/MathUtils.js#L187) function.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | Value to interpolate |
| `min?` | `number` | `0` | Lower limit |
| `max?` | `number` | `1` | Upper limit |

#### Returns

`number`

***

<a id="copymat4rotation"></a>

### CopyMat4Rotation()

```ts
function CopyMat4Rotation(src, dst?): Float32Array<ArrayBufferLike>;
```

Copy matrix rotation component into the given 4x4 matrix.
Adapted from three.js' [extractRotation](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/Matrix4.js#L289) method.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | Matrix to extract rotation |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | Destination matrix |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

***

<a id="getmat4rotation"></a>

### GetMat4Rotation()

```ts
function GetMat4Rotation(
   src, 
   dst?, 
order?): Float32Array<ArrayBufferLike>;
```

Get matrix rotation as Euler angles assuming the upper 3x3 matrix is a pure rotation matrix.
Adapted from ogl's [fromRotationMatrix](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js#L2) function.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | Matrix to extract rotation |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | `...` | Destination vector |
| `order?` | `string` | `"XYZ"` | Rotation order |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### Throws

`ERROR.INVALID_ROTATION_ORDER` if `order` argument is not valid.

***

<a id="getmat4scale"></a>

### GetMat4Scale()

```ts
function GetMat4Scale(src): number;
```

Get maximum scale on a matrix axis.
Adapted from ogl's [getMaxScaleOnAxis](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/Mat4Func.js#L524) function.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | Matrix to extract scale |

#### Returns

`number`
