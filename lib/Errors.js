import { ERROR_MESSAGE, ERROR_CAUSE } from "@/Constants";

/**
 * @param {import("@/Constants").ErrorCause} warning
 * @param {string} [message = undefined]
 */
export function ThrowWarning(warning, message)
{
    console.warn(ERROR_MESSAGE[warning] + (message ?? ""));
}

/**
 * @param {import("@/Constants").ErrorCause} error
 * @param {string} [message = undefined]
 */
export function ThrowError(error, message)
{
    throw new Error(ERROR_MESSAGE[error] + (message ?? ""), { cause: ERROR_CAUSE[error] });
}
