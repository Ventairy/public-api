/**
 * Returns a shallow copy of the input object with only entries
 * whose value is NOT `undefined`. `null` values are preserved.
 *
 * This is useful for building sparse database update objects from
 * partial DTOs where undefined fields should be omitted (not set to null).
 */
function filterUndefined<T extends object>(input: T): Partial<T> {
	return Object.fromEntries(Object.entries(input).filter(([_, value]) => value !== undefined)) as Partial<T>;
}

export const ObjectUtils = {
	filterUndefined,
} as const;
