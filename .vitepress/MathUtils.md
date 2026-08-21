[UWAL](Modules.md) / MathUtils

## Description

A set of mathematical variables and functions for general-purpose usage.

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
| `value` | `number` | `undefined` | Value to constrain. |
| `min?` | `number` | `0` | Lower limit. |
| `max?` | `number` | `1` | Upper limit. |

#### Returns

`number`

***

<a id="random"></a>

### Random()

```ts
function Random(min?, max?): number;
```

Get a pseudorandom float between `min` (inclusive) and `max` (exclusive).
When `max` is omitted, it defaults to `min` while `min = 0`.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `min?` | `number` | `1` | Lower or upper limit. |
| `max?` | `number` | `undefined` | Upper limit. |

#### Returns

`number`

***

<a id="randomint"></a>

### RandomInt()

```ts
function RandomInt(min, max?): number;
```

Get a pseudorandom integer between `min` and `max` values (inclusive).
When `max` is omitted, it defaults to `min` while `min = 0`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `min` | `number` | Lower or upper limit. |
| `max?` | `number` | Upper limit. |

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
| `value` | `number` | `undefined` | Value to interpolate. |
| `min?` | `number` | `0` | Lower limit. |
| `max?` | `number` | `1` | Upper limit. |

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
Adapted from three.js' [smootherstep](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/MathUtils.js#L178-L196) function.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | Value to interpolate. |
| `min?` | `number` | `0` | Lower limit. |
| `max?` | `number` | `1` | Upper limit. |

#### Returns

`number`

***

<a id="copymat4rotation"></a>

### CopyMat4Rotation()

```ts
function CopyMat4Rotation(src, dst?): Float32Array<ArrayBufferLike>;
```

Copy the matrix rotation component into the given 4x4 matrix.
Adapted from three.js' [extractRotation](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/Matrix4.js#L280-L326) method.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | Matrix to extract rotation. |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | Destination matrix. |

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

Get matrix rotation as Euler angles, assuming the upper 3x3 matrix is a pure rotation matrix.
Adapted from OGL's [fromRotationMatrix](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js) function.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | Matrix to extract rotation. |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | `...` | Destination vector. |
| `order?` | `string` | `"XYZ"` | Rotation order. |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### Throws

`ERROR.INVALID_ROTATION_ORDER` if the `order` argument is not valid.

***

<a id="getmat4scale"></a>

### GetMat4Scale()

```ts
function GetMat4Scale(src): number;
```

Get maximum scale on a matrix axis.
Adapted from OGL's [getMaxScaleOnAxis](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/Mat4Func.js#L524-L540) function.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | Matrix to extract scale. |

#### Returns

`number`
