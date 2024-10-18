import { ChartDataset } from 'chart.js';
import LineData2020ToBorough from './mta/line-data-2020-to-borough';

export interface Turnstile2020Data {
	avg_exits: string; // float string
	by_month_date: string; // ISO
	line_name: string;
	station: string;
}
/**
 * station e.g. "103 ST"
 * station.date is an ISO string
 * line_name e.g.  '1', '6', 'BC', etc.
 */
export interface RouteData {
	[station: string]: {
		[date: string]: {
			[line_name: string]: number;
		};
	};
}

export type MtaChartDatum = (number | null)[];
export type MtaChartSeries = ChartDataset<'bar', MtaChartDatum>[];

export const monthLabels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export const strToTwoDecimals = (str: string): number =>
	Number(Number(str).toFixed(2));

export const LIMIT = 100;

const formatLineTooltip = (
	station: string,
	line: string,
	ridership: number
) => {
	const prettyPrintRidership =
		(ridership > 0 ? '+' : '-') +
		ridership.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `${line}, ${station}: ${prettyPrintRidership}`;
};

const getDiffInRidershipOverMonth = (temp1: Record<string, number>) => {
	let prevRidership = 0;
	const diff = [];
	for (let date in temp1) {
		const monthlyDiff = temp1[date] - prevRidership;
		if (prevRidership !== 0) {
			/*
				The numbers reported are defined as cumulative, but straight processing
				returns occasional negative values which makes me think that when the
				reporting device is reinitialized, the value can change arbitrarily and
				less than the previous reported value, so for argument's sake, going to
				clamp to positive values
			*/
			diff.push(monthlyDiff > 0 ? monthlyDiff : 0);
		}
		prevRidership = temp1[date];
	}
	return diff;
};

export const routeDataToChartData = (
	routeData: RouteData,
	startMonth: number
) => {
	let chartData: MtaChartSeries = [];

	// who's the dumbass who started months at 0 instead of 1?

	for (const station in routeData) {
		if (routeData.hasOwnProperty(station)) {
			const stationData = routeData[station];
			for (const line in stationData) {
				if (stationData.hasOwnProperty(line)) {
					const lineData = stationData[line];
					const diff: Array<number | null> =
						getDiffInRidershipOverMonth(lineData);

					while (diff.length < 12) {
						// 2020 is the only year we start early
						if (startMonth > 1) {
							diff.unshift(null);
						} else {
							diff.push(null);
						}
					}
					chartData.push({
						label: station + ' - ' + line,
						data: diff,
					});
				}
			}
		}
	}

	console.log(chartData);
	return chartData;
};

export const routeDataToBoroughs = (routeData: RouteData) => {
	const boroughData: Record<string, RouteData> = {};
	for (const stationLabel in routeData) {
		if (routeData.hasOwnProperty(stationLabel)) {
			const data = routeData[stationLabel];
			const stationBorough = LineData2020ToBorough[stationLabel];
			if (boroughData[stationBorough]) {
				boroughData[stationBorough][stationLabel] = data;
			} else {
				boroughData[stationBorough] = {
					[stationLabel]: data,
				};
			}
		}
	}
	return boroughData;
};

export const boroughDataToChart = (
	boroughData: Record<string, RouteData>,
	startMonth: number
) => {
	const boroughChartData: Record<string, MtaChartSeries> = {};
	for (const boroughLabel in boroughData) {
		if (boroughData.hasOwnProperty(boroughLabel)) {
			const boroughDatum = boroughData[boroughLabel];
			boroughChartData[boroughLabel] = routeDataToChartData(
				boroughDatum,
				startMonth
			);
		}
	}
	return boroughChartData;
};
