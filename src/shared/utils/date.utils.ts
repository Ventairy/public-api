export const DateUtils = {
	unixSecondsTimestampToISO(unix: number): string {
		return new Date(unix * 1000).toISOString();
	},
};
