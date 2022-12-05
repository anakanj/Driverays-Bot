export function formatAsPercent(number: number, decimals = 2) {
	const format = new Intl.NumberFormat("default", {
		style: "percent",
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format;
	return format(number / 100);
}
