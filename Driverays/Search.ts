import { Driverays } from "./";
/**
 *  Cari film dengan mengetikkan query nya
 * @param query
 * @returns
 */
async function DriveraysSearch(query: string) {
	// JIK
	const search_query = query.split(" ").join("+");
	const url = `https://167.86.71.48/?s=${search_query}&post_type=post`;
	const results = await Driverays(url);
	// console.log(results);
	return results;
}
// DriveraysSearch('home alone');
// module.exports = DriveraysSearch;
export { DriveraysSearch };
