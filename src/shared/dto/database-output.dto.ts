export abstract class DatabaseOutputDto {
	/**
	 * Converts a database row into the corresponding output DTO.
	 * Must be implemented by subclasses.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	static fromDatabaseRow(row: any, ...args: any[]): any {
		throw new Error("Not implemented: fromDatabaseRow must be overridden in subclasses.");
	}
}
