[UWAL](../Modules.md) / utils/Math

## Type Aliases

<a id="quat"></a>

### Quat

```ts
type Quat = quat;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Variables

<a id="euclideanmodulo"></a>

### EuclideanModulo

```ts
const EuclideanModulo: (n, m) => number = utils.euclideanModulo;
```

Compute the euclidean modulo

```
// table for n / 3
-5, -4, -3, -2, -1,  0,  1,  2,  3,  4,  5   <- n
------------------------------------
-2  -1  -0  -2  -1   0,  1,  2,  0,  1,  2   <- n % 3
 1   2   0   1   2   0,  1,  2,  0,  1,  2   <- euclideanModule(n, 3)
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `n` | `number` | dividend |
| `m` | `number` | divisor |

#### Returns

`number`

the euclidean modulo of n / m

***

<a id="degreestoradians"></a>

### DegreesToRadians

```ts
const DegreesToRadians: (degrees) => number = utils.degToRad;
```

Convert degrees to radians

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `degrees` | `number` | Angle in degrees |

#### Returns

`number`

angle converted to radians

***

<a id="radianstodegrees"></a>

### RadiansToDegrees

```ts
const RadiansToDegrees: (radians) => number = utils.radToDeg;
```

Convert radians to degrees

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `radians` | `number` | Angle in radians |

#### Returns

`number`

angle converted to degrees

***

<a id="inverselerp"></a>

### InverseLerp

```ts
const InverseLerp: (a, b, v) => number = utils.inverseLerp;
```

Compute the opposite of lerp. Given a and b and a value between
a and b returns a value between 0 and 1. 0 if a, 1 if b.
Note: no clamping is done.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `number` | start value |
| `b` | `number` | end value |
| `v` | `number` | value between a and b |

#### Returns

`number`

(v - a) / (b - a)

***

<a id="setepsilon"></a>

### SetEpsilon

```ts
const SetEpsilon: (v) => number = utils.setEpsilon;
```

Set the value for EPSILON for various checks

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `v` | `number` | Value to use for EPSILON. |

#### Returns

`number`

previous value of EPSILON;

***

<a id="epsilon"></a>

### EPSILON

```ts
const EPSILON: number = utils.EPSILON;
```

***

<a id="lerp"></a>

### Lerp

```ts
const Lerp: (a, b, t) => number = utils.lerp;
```

Lerps between a and b via t

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `number` | starting value |
| `b` | `number` | ending value |
| `t` | `number` | value where 0 = a and 1 = b |

#### Returns

`number`

a + (b - a) * t

***

<a id="phi"></a>

### PHI

```ts
const PHI: number;
```

***

<a id="delta_update"></a>

### DELTA\_UPDATE

```ts
const DELTA_UPDATE: number;
```

***

<a id="delta_frame"></a>

### DELTA\_FRAME

```ts
const DELTA_FRAME: number;
```

***

<a id="rad"></a>

### RAD

```ts
const RAD: number;
```

***

<a id="deg"></a>

### DEG

```ts
const DEG: number;
```

***

<a id="hpi"></a>

### HPI

```ts
const HPI: number;
```

***

<a id="tau"></a>

### TAU

```ts
const TAU: number;
```

## Functions

<a id="clamp"></a>

### Clamp()

```ts
function Clamp(
   value, 
   min?, 
   max?): number;
```

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | - |
| `min?` | `number` | `0` | - |
| `max?` | `number` | `1` | - |

#### Returns

`number`

***

<a id="randomint"></a>

### RandomInt()

```ts
function RandomInt(min, max): number;
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `min` | `number` | - |
| `max` | `number` | - |

#### Returns

`number`

***

<a id="random"></a>

### Random()

```ts
function Random(min?, max?): number;
```

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `min?` | `number` | `0` | - |
| `max?` | `number` | `1` | - |

#### Returns

`number`

***

<a id="getmat4rotation"></a>

### GetMat4Rotation()

```ts
function GetMat4Rotation(
   src, 
   dst?, 
order?): Float32Array<ArrayBufferLike>;
```

Get matrix rotation as an Euler vector assuming the upper 3x3 matrix is a pure rotation matrix.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | - |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | `...` | - |
| `order?` | `string` | `"XYZ"` | - |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### See

[https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js)

***

<a id="copymat4rotation"></a>

### CopyMat4Rotation()

```ts
function CopyMat4Rotation(src, dst?): Float32Array<ArrayBufferLike>;
```

Copy matrix rotation component into the given 4x4 matrix.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | - |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | - |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### See

[https://github.com/mrdoob/three.js/blob/e61ab90bd7b03dd9956d170476966ca7d9f7af46/src/math/Matrix4.js#L285](https://github.com/mrdoob/three.js/blob/e61ab90bd7b03dd9956d170476966ca7d9f7af46/src/math/Matrix4.js#L285)

***

<a id="composemat4"></a>

### ComposeMat4()

```ts
function ComposeMat4(
   position, 
   rotation, 
   scale, 
dst?): Float32Array<ArrayBufferLike>;
```

Set this matrix to the transformation composed of the given position, rotation (Quaternion) and scale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | `Float32Array`\<`ArrayBufferLike`\> | - |
| `rotation` | `Float32Array`\<`ArrayBufferLike`\> | - |
| `scale` | `Float32Array`\<`ArrayBufferLike`\> | - |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | - |

#### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### See

[https://github.com/mrdoob/three.js/blob/2df1da20673ac2fb366ae980bab178abc03bf2cd/src/math/Matrix4.js#L976](https://github.com/mrdoob/three.js/blob/2df1da20673ac2fb366ae980bab178abc03bf2cd/src/math/Matrix4.js#L976)

***

<a id="getmaxaxisscale"></a>

### GetMaxAxisScale()

```ts
function GetMaxAxisScale(src): number;
```

Get maximum scale on a matrix axis.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `Float32Array`\<`ArrayBufferLike`\> | - |

#### Returns

`number`

#### See

[https://github.com/oframe/ogl/blob/master/src/math/functions/Mat4Func.js#L524-L540](https://github.com/oframe/ogl/blob/master/src/math/functions/Mat4Func.js#L524-L540)

***

<a id="smootherstep"></a>

### SmootherStep()

```ts
function SmootherStep(
   value, 
   min?, 
   max?): number;
```

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | - |
| `min?` | `number` | `0` | - |
| `max?` | `number` | `1` | - |

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

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `number` | `undefined` | - |
| `min?` | `number` | `0` | - |
| `max?` | `number` | `1` | - |

#### Returns

`number`
