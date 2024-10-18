import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	Typography,
} from '@mui/material';
import {
	BarController,
	BarElement,
	CategoryScale,
	Chart,
	Colors,
	Legend,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { NYC_Borough } from '../@types/mta-api';
import { getChartData } from '../api/mta-chart-api';
import { monthLabels, MtaChartSeries } from '../util/mta-chart';

Chart.register(
	Colors,
	BarController,
	BarElement,
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend
);
export const MTAChart = () => {
	const [baseData, setBaseData] = useState<Record<string, MtaChartSeries>>({});
	const [selectedData, setSelectedData] = useState<MtaChartSeries>();
	const [selectedBorough, setSelectedBorough] = useState(NYC_Borough.MANHATTAN);
	const chartElRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	useEffect(() => {
		console.log('init mta chart');
		const startDate = new Date('2020-01-01');
		getChartData(startDate).then((boroughData) => {
			setBaseData(boroughData);
			setSelectedData(boroughData[NYC_Borough.MANHATTAN]);
		});
	}, []);

	useEffect(() => {
		if (!chartElRef.current) {
			console.warn('data loaded without chart element painted');
			return;
		}
		if (!selectedData) {
			return;
		}
		if (chartRef.current) {
			chartRef.current.data.datasets = selectedData;
			chartRef.current.update();
			return;
		}
		chartRef.current = new Chart(chartElRef.current, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
					},
					title: {
						display: true,
						text: 'Ridership data',
					},
					tooltip: {
						intersect: true,
						mode: 'point',
					},
				},
			},
			data: {
				labels: monthLabels,
				datasets: selectedData,
			},
		});
	}, [selectedData]);

	const handleBoroughChange = (e: SelectChangeEvent) => {
		const borough = e.target.value as NYC_Borough;
		setSelectedBorough(borough);
		setSelectedData(baseData[borough]);
	};

	return (
		<div id="mta-chart-container">
			{!selectedData && <h2>Loading</h2>}
			{selectedData && (
				<Stack sx={{height: '100%', width: '100%'}}>
					<Stack direction="row" alignItems="center" sx={{p: 1, gap: '8px'}}>
						<Typography variant="h1" sx={{fontSize: '2rem'}}>
							Ridership Changes per Month
						</Typography>
						<FormControl sx={{minWidth: '150px'}}>
							<InputLabel id="borough-select-label">Borough</InputLabel>
							<Select
								labelId="borough-select-label"
								id="borough-select"
								value={selectedBorough}
								label="Borough"
								autoWidth
								onChange={handleBoroughChange}
							>
								{Object.values(NYC_Borough).map((b) => (
									<MenuItem key={b} value={b}>
										{b}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Stack>
					<Typography p={1}>
						Month to month diff calculated based on cumulative ridership values
						per line, per station. Positive slopes indicate increase in
						ridership, negative slope indicates decrease. Zero values indicate
						no ridership for that time period. WIP: MTA data only setup for 2020
						currently
					</Typography>

					<canvas id="ridership-chart" ref={chartElRef}></canvas>
				</Stack>
			)}
		</div>
	);
};
