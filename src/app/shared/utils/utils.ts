
export function formatString(input: string): string {
	const lowercased = input.toLowerCase();
	const trimmed = lowercased.trim();
	const formatted = trimmed.replace(/\s+/g, '-');
	return formatted;
}
