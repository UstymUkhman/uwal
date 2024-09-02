/**
 * @param {typeof ERROR[keyof typeof ERROR]} warning
 * @param {string} [message]
 */
export function ThrowWarning(warning: (typeof ERROR)[keyof typeof ERROR], message?: string | undefined): void;
/**
 * @param {typeof ERROR[keyof typeof ERROR]} error
 * @param {string} [message]
 */
export function ThrowError(error: (typeof ERROR)[keyof typeof ERROR], message?: string | undefined): void;
export const EVENT: any;
export const ERROR: any;
export const ERROR_MESSAGE: any;
export const ERROR_CAUSE: any;
//# sourceMappingURL=Errors.d.ts.map