import {
	BoroughChartData,
	RouteData,
	TurnstileData,
	UnitToStation,
	UnitToStationRaw,
} from '../@types/mta-api';
import { dispatchLoadingUpdate } from '../util/events';
import {
	MTA_DATA_API_LIMIT,
	boroughDataToChart,
	routeDataToBoroughs,
	strToTwoDecimals,
} from '../util/mta-chart';
import { standardizeMTA_API_Data } from './mta-api-obj';

/**
 * Original URLs for data retrieval, kept for posterity
 * const url2020RowCount = `https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`;
 * const url2020Data = (offset: number) =>
 * `https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${MTA_DATA_API_LIMIT}%0AOFFSET%20${offset}&`;
 * const url2021RowCount = `https://data.ny.gov/resource/uu7b-3kff.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222021-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222021-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`;
 * const url2021Data = (offset: number) =>
 * `https://data.ny.gov/resource/uu7b-3kff.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222021-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222021-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${MTA_DATA_API_LIMIT}%0AOFFSET%20${offset}&`;
 * const url2022RowCount =
 * 'https://data.ny.gov/resource/k7j9-jnct.json?$query=SELECT%0A%20%20%60unit%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AGROUP%20BY%20%60unit%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&';
 * const url2022Data = (offset: number) =>
 * `https://data.ny.gov/resource/k7j9-jnct.json?$query=SELECT%0A%20%20%60unit%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AGROUP%20BY%20%60unit%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60unit%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${MTA_DATA_API_LIMIT}%0AOFFSET%20${offset}&`;
 * const url2023RowCount = `https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222023-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222023-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`;
 * const url2023Data = (offset: number) =>
 * `https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222023-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222023-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0AORDER%20BY%0A%20%20%60station_complex%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60borough%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${MTA_DATA_API_LIMIT}%0AOFFSET%20${offset}&`;
 */
const url2024RowCount = `https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222024-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222024-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`;
const url2024Data = (offset: number) =>
	`https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222024-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222024-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0AORDER%20BY%0A%20%20%60station_complex%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60borough%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${MTA_DATA_API_LIMIT}%0AOFFSET%20${offset}&`;

const urlUnitToStation = `https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%20%60station%60%2C%20%60unit%60%20GROUP%20BY%20%60station%60%2C%20%60unit%60`;

interface AccessData {
	[startDate: string]: {
		dataUrl: string | ((offset: number) => string);
		countUrl?: string;
		stationMap?: string;
	};
}
const apiDataByYear: AccessData = {
	'2020-01-01': {
		dataUrl: `${process.env.PUBLIC_URL}/data/mta-ridership-exits-2020.json`,
	},
	'2021-01-01': {
		dataUrl: `${process.env.PUBLIC_URL}/data/mta-ridership-exits-2021.json`,
	},
	'2022-01-01': {
		dataUrl: `${process.env.PUBLIC_URL}/data/mta-ridership-exits-2022.json`,
		stationMap: urlUnitToStation,
	},
	'2023-01-01': {
		dataUrl: `${process.env.PUBLIC_URL}/data/mta-ridership-exits-2023.json`,
	},
	'2024-01-01': {
		dataUrl: url2024Data,
		countUrl: url2024RowCount,
	},
};

export const getChartData = async (
	accessDate: Date
): Promise<BoroughChartData> => {
	const accessDateString = accessDate
		.toISOString()
		.split('T')[0] as keyof typeof apiDataByYear;
	if (!(accessDateString in apiDataByYear)) {
		throw new Error(`No data configured for date ${accessDateString}`);
	}
	let routeData: RouteData = {};
	const apiYearDatum = apiDataByYear[accessDateString];
	try {
		let totalRows = 0;
		if (apiYearDatum.countUrl) {
			totalRows = await fetch(apiYearDatum.countUrl)
				.then((r) => r.json())
				.then((r) => r[0].__explore_count_name__ as number);

			dispatchLoadingUpdate({
				eventLabel: 'mta-api-segment-count',
				value: totalRows / MTA_DATA_API_LIMIT,
			});
		}

		let stationMap: UnitToStation;
		if (apiYearDatum?.stationMap) {
			const stationMapRaw: UnitToStationRaw = await fetch(
				apiYearDatum.stationMap
			).then((r) => r.json());
			stationMap = stationMapRaw.reduce<UnitToStation>(
				(acc, {unit, station}) => {
					acc[unit] = station;
					return acc;
				},
				{}
			);
		}

		if (typeof apiYearDatum.dataUrl === 'function') {
			const allOffsetRequests = [];
			for (
				let offset = 0;
				offset < totalRows - 1;
				offset += MTA_DATA_API_LIMIT
			) {
				allOffsetRequests.push(
					fetch(apiYearDatum.dataUrl(offset)).then((r) => {
						dispatchLoadingUpdate({
							eventLabel: 'mta-api-segment-loaded',
							value: offset,
						});
						return r.json();
					})
				);
			}
			(await Promise.all(allOffsetRequests))
				.flatMap((d) => d)
				.reduce((acc: any, stationMonthDatum: TurnstileData) => {
					const apiDatum = standardizeMTA_API_Data(
						stationMonthDatum,
						stationMap
					);

					if (!acc[apiDatum.station]) {
						acc[apiDatum.station] = {};
					}
					if (!acc[apiDatum.station][apiDatum.line_name]) {
						acc[apiDatum.station][apiDatum.line_name] = {};
					}
					acc[apiDatum.station][apiDatum.line_name][apiDatum.by_month_date] =
						strToTwoDecimals(apiDatum.avg_exits);
					return acc;
				}, routeData);
		} else {
			routeData = await fetch(apiYearDatum.dataUrl).then((r) => r.json());
		}
	} catch (e: any) {
		console.warn(e);
		throw new Error(e || 'chart api error');
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
