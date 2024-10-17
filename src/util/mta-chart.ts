import { LineChartProps, LineSeriesType } from '@mui/x-charts';

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

export type ChartDatum = LineSeriesType['data'];
export type ChartSeries = LineChartProps['series'];

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
	startDateString: string,
	routeData: RouteData
): ChartSeries => {
	let chartData: ChartSeries = [];

	for (const station in routeData) {
		if (routeData.hasOwnProperty(station)) {
			const lineData = routeData[station];
			for (const line in lineData) {
				if (lineData.hasOwnProperty(line)) {
					const lineMonthlyRidership = lineData[line];
					const diff: Array<number | null> =
						getDiffInRidershipOverMonth(lineMonthlyRidership);

					// const data: ChartDatum = Object.values<null | number>(
					// 	lineMonthlyRidership
					// );

					const startDate = new Date(startDateString);
					const startYear = startDate.getFullYear();
					if (startDate.getTime() > new Date(startYear).getTime()) {
						// if startDate > startYear, pad with zeros from the start
						while (diff.length < 12) {
							diff.unshift(null);
						}
					} else {
						// if startDate <= startYear but the array is short, pad with zeros from the end
						while (diff.length < 12) {
							diff.push(null);
						}
					}
					chartData.push({
						showMark: true,
						valueFormatter: (diff) =>
							diff ? formatLineTooltip(station, line, diff) : '',
						data: diff,
					});
				}
			}
		}
	}

	console.log(chartData);
	return chartData;
};
