import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js';
import Chroma from 'chroma-js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { isoTimeNoMs } from '../api/mta-api';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const options = {
	responsive: true,
	plugins: {
		legend: {
			position: 'top' as const,
		},
		title: {
			display: true,
			text: 'Chart.js Line Chart',
		},
	},
};

const monthLabels = [
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
	'December'
];

interface Turnstile2020Data {
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
interface RouteData {
	[station: string]: {
		[date: string]: {
			[line_name: string]: number;
		};
	};
}

interface ChartData {
	label: string;
	data: number[];
}

const strToTwoDecimals = (str: string): number =>
	Number(Number(str).toFixed(2));
const LIMIT = 100;
const getData = async (startDate: string) => {
	const year = new Date(startDate).getFullYear();
	const endDate = encodeURIComponent(isoTimeNoMs(new Date(year + '-12-31')));
	const routeData: RouteData = {};
	try {
		const totalRows = await fetch(
			`https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%22${startDate}%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%22${endDate}%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0A%7C%3E%0ASELECT%20count(*)%20AS%20%60__explore_count_name__%60&`
		)
			.then((r) => r.json())
			.then((r) => r[0].__explore_count_name__ as number);
		// prod
		// for (let i = 0; i < totalRows - 1; i += LIMIT) {
		console.log('REMOVE DEBUG LOOP');
		for (let offset = 0; offset < 200; offset += LIMIT) {
			console.log(
				'Loading rows ' +
					offset +
					' to ' +
					(offset + LIMIT - 1) +
					' of ' +
					totalRows +
					'. Remaining cycles: ' +
					(totalRows - offset - 1) / LIMIT
			);
			const rowData = await fetch(
				`https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-03-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20${LIMIT}%0AOFFSET%20${offset}&`
			).then((r) => r.json() as Promise<Turnstile2020Data[]>);
			console.log('Loaded. Processing rowData');
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
			console.log('Current dict:', routeData);
		}
	} catch (e) {
		console.warn(e);
	}
	return routeData;
};

const generateGradients = (gradientLength: number): string[] => {
	const scale = Chroma.scale(['orange', 'navy'])
		.mode('hsl')
		.domain([0, gradientLength])
		.colors(gradientLength);
	return scale;
};

const setupGenerateColor = (gradientLength: number) => {
	const gradients = generateGradients(gradientLength);
	return (index: number) => {
		const color = gradients[index];
		return {
			borderColor: color,
			backgroundColor: Chroma(color).alpha(0.5),
		};
	};
};

const routeDataToChartData = (
	startDate: string,
	rd: RouteData
): ChartData[] => {
	let chartData: ChartData[] = [];

	const generateColor = setupGenerateColor(Object.keys(rd).length);

	let stationIndex = 0;
	for (const station in rd) {
		if (rd.hasOwnProperty(station)) {
			const lineData = rd[station];
			for (const line in lineData) {
				if (lineData.hasOwnProperty(line)) {
					const lineMonthlyRidership = lineData[line];

					const data = Object.values(lineMonthlyRidership);
					if (new Date(startDate) >= new Date('2020-01-01T00:00:00.000')) {
						// if startDate > startYear, pad with zeros from the start
						while (data.length < 12) {
							data.unshift(0);
						}
					} else {
						// if startDate === startYear but the array is short, pad with zeros from the end
						while (data.length < 12) {
							data.push(0);
						}
					}
					chartData.push({
						label: `${station} - ${line}`,
						data,
						...generateColor(stationIndex),
					});
				}
			}
		}
		stationIndex++;
	}

	return chartData;
};

export const MTAChart = () => {
	const [data, setData] = useState<{
		labels: string[];
		datasets: ChartData[];
	}>();
	const startDate = '2020-03-01';
	useEffect(() => {
		console.log('init mta chart');
		getData(startDate).then((d) => {
			const chartData = routeDataToChartData(startDate, d);
			setData({
				labels: monthLabels,
				datasets: chartData,
			});
		});
	}, []);
	return (
		<div id="mta-chart-container">
			{data && <Line options={options} data={data} />}
		</div>
	);
};
