[UWAL](Modules.md) / Errors

## Type Aliases

<a id="errorcause"></a>

### ErrorCause

```ts
type ErrorCause = 
  | "WEBGPU_NOT_SUPPORTED"
  | "ADAPTER_NOT_FOUND"
  | "DEVICE_NOT_FOUND"
  | "DEVICE_LOST"
  | "CANVAS_NOT_FOUND"
  | "CONTEXT_NOT_FOUND"
  | "COMMAND_ENCODER_NOT_FOUND"
  | "PIPELINE_NOT_FOUND";
```

#### Type Parameters

| Type Parameter |
| ------ |

## Variables

<a id="error_cause"></a>

### ERROR\_CAUSE

```ts
const ERROR_CAUSE: Readonly<Record<ErrorCause, number>>;
```

Possible internal errors and their `cause` values to handle them gracefully.
