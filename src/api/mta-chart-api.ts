import {
	LIMIT,
	RouteData,
	Turnstile2020Data,
	boroughDataToChart,
	routeDataToBoroughs,
	strToTwoDecimals,
} from '../util/mta-chart';
const url2020RowCount = () =>
	`https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`;
const url2020Data = (offset: number) =>
	`https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${LIMIT}%0AOFFSET%20${offset}&`;

const AccessData = {
	'2020-01-01': {
		data: url2020Data,
		count: url2020RowCount,
	},
};

export const getChartData = async (accessDate: Date) => {
	const accessDateString = accessDate
		.toISOString()
		.split('T')[0] as keyof typeof AccessData;
	const accessData = AccessData[accessDateString];
	const routeData: RouteData = {};
	try {
		const totalRows = await fetch(accessData.count())
			.then((r) => r.json())
			.then((r) => r[0].__explore_count_name__ as number);
		// prod
		for (let offset = 0; offset < totalRows - 1; offset += LIMIT) {
			// console.warn('REMOVE DEBUG LOOP');
			// for (let offset = 0; offset < 100; offset += LIMIT) {
			console.debug(
				'Loading rows ' +
					offset +
					' to ' +
					(offset + LIMIT - 1) +
					' of ' +
					totalRows +
					'. Remaining cycles: ' +
					(totalRows - offset - 1) / LIMIT
			);
			const rowData = await fetch(accessData.data(offset)).then(
				(r) => r.json() as Promise<Turnstile2020Data[]>
			);
			console.debug('Loaded. Processing rowData');
			rowData.reduce((acc: any, stationMonthData: Turnstile2020Data) => {
				if (!acc[stationMonthData.station]) {
					acc[stationMonthData.station] = {};
				}
				if (!acc[stationMonthData.station][stationMonthData.line_name]) {
					acc[stationMonthData.station][stationMonthData.line_name] = {};
				}
				acc[stationMonthData.station][stationMonthData.line_name][
					stationMonthData.by_month_date
				] = strToTwoDecimals(stationMonthData.avg_exits);
				return acc;
			}, routeData);
		}
	} catch (e) {
		console.warn(e);
	}

	const boroughData = routeDataToBoroughs(routeData);
	const boroughChartData = boroughDataToChart(
		boroughData,
		accessDate.getUTCMonth()
	);

	console.debug(
		'Current dict:',
		routeData,
		'formatted borough data:',
		boroughData
	);
	return boroughChartData;
};
