import {
	BoroughChartData,
	BoroughChartDatum,
	MagnitudeShift,
	MagnitudeShiftTracking,
	MtaChartDatum,
	MtaChartSeries,
	RouteData,
} from '../@types/mta-api';
import LineData2020ToBorough from './mta/line-data-2020-to-borough';

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

export const MTA_DATA_API_LIMIT = 100;

export const prettyPrintRidership = (ridership: number, showSpin = false) => {
	const commaRidership = ridership
		.toFixed(2)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	if (showSpin) {
		return (ridership > 0 ? '+' : '-') + commaRidership;
	} else {
		return commaRidership;
	}
};

const getDiffInRidershipOverMonth = (
	ridershipData: Record<string, number>,
	stop: string
): {diff: MtaChartDatum; magShiftTracking: MagnitudeShiftTracking} => {
	const magShiftTracking = [];
	let prevRidership = 0;
	const diff = [];
	for (let date in ridershipData) {
		const currentRidership = ridershipData[date];
		if (prevRidership !== 0) {
			let adjDiff = 0;
			const basicMonthlyDiff = currentRidership - prevRidership;
			/*
				The numbers reported are defined as cumulative, but straight processing
				returns occasional negative values which makes me think that when the
				reporting device is reinitialized, the value can change arbitrarily and
				less than the previous reported value, so for argument's sake, going to
				clamp to positive values
			*/
			if (basicMonthlyDiff > 0) {
				adjDiff = basicMonthlyDiff;
			}
			/*
				Continuing with the "reinitialized value changes wildly" theory:
				The next issue with the data encountered is wild jumps by several
				magnitude, e.g. 2m to 40m riders or 40m to 400m between two months,
				which is itself alarming and makes me think someone is messing with
				their base 10s, but also how the average diff returns to pre-jump value.
				e.g. c.2020, 191 st - 1 line:
				[
					2201876.13, 2211228.7, 2214287.51, 2216439.42, 2219777.5, 43689640.95,
					404631069.6, 403315618.87, 403322207.98, 404320347.18, 403762079.77
				]
			*/
			let magnitude = currentRidership / prevRidership;
			if (magnitude > 9 || basicMonthlyDiff > 10000000) {
				while (Math.round(magnitude) % 10 !== 0) {
					magnitude++;
				}
				const magAdjRidership = currentRidership / magnitude;
				adjDiff = Math.abs(magAdjRidership - prevRidership);

				const magShift: MagnitudeShift = {
					id: `${stop}-${date}`,
					stop,
					date,
					magAdjDiff: +adjDiff.toFixed(2),
					magAdjRidership,
					currentRidership,
					magnitude: +magnitude.toFixed(2),
					prevRidership,
				};
				magShiftTracking.push(magShift);
				console.warn('magnitude shift', magShift);
			}
			diff.push(adjDiff);
		}
		prevRidership = currentRidership;
	}
	return {diff, magShiftTracking};
};

export const routeDataToChartData = (
	routeData: RouteData,
	startMonth: number
): BoroughChartDatum => {
	const totalMagShiftTracking: MagnitudeShiftTracking = [];
	let chartData: MtaChartSeries = [];

	// who's the dumbass who started months at 0 instead of 1?

	let avgYMax = 0;
	let yMax = 0;
	for (const station in routeData) {
		if (routeData.hasOwnProperty(station)) {
			const stationData = routeData[station];
			for (const line in stationData) {
				if (stationData.hasOwnProperty(line)) {
					const lineData = stationData[line];
					const label = station + ' - ' + line;
					const {diff, magShiftTracking} = getDiffInRidershipOverMonth(
						lineData,
						label
					);
					totalMagShiftTracking.push(...magShiftTracking);
					// since we're diffing over months, pad one null into the front
					diff.unshift(null);
					while (diff.length < 12) {
						if (startMonth > 1) {
							diff.unshift(null);
						} else {
							diff.push(null);
						}
					}
					chartData.push({
						label: label,
						data: diff,
					});

					// eslint-disable-next-line no-loop-func
					let localAvgYMax = diff.reduce<number>((acc, v) => {
						if (v) {
							yMax = Math.max(yMax, v);
							return (acc += v);
						} else {
							return acc || 0;
						}
					}, 0);
					localAvgYMax |= 0;
					localAvgYMax /= 11; // 11 months

					avgYMax = Math.max(avgYMax, localAvgYMax);
				}
			}
		}
	}

	console.log(avgYMax);

	return {
		chartData,
		magShiftTracking: totalMagShiftTracking,
		avgYMax,
		yMax,
	};
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
): BoroughChartData => {
	const boroughChartData: BoroughChartData = {};
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

export const flattenBoroughChartData = (allBoroughs: BoroughChartData) => {
	return Object.values(allBoroughs).reduce<BoroughChartDatum>(
		(acc, boroughData) => {
			return {
				chartData: [...acc.chartData, ...boroughData.chartData],
				magShiftTracking: [
					...acc.magShiftTracking,
					...boroughData.magShiftTracking,
				],
				avgYMax: Math.max(acc.yMax, boroughData.yMax),
				yMax: Math.max(acc.yMax, boroughData.yMax),
			};
		},
		{chartData: [], magShiftTracking: [], avgYMax: 0, yMax: 0}
	);
};
