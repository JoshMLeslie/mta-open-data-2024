import { Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useEffect, useRef, useState } from 'react';
import { getChartData } from '../api/mta-chart-api';
import { ChartSeries, monthLabels } from '../util/mta-chart';

export const MTAChart = () => {
	const [data, setData] = useState<ChartSeries>();
	const chartRef = useRef<any>(null);

	const startDate = '2020-03-01';
	useEffect(() => {
		console.log('init mta chart');
		getChartData(startDate).then((datasets) => {
			setData(datasets);
		});
	}, []);

	return (
		<div id="mta-chart-container">
			{!data && <h2>Loading</h2>}
			{data && (
				<Stack sx={{height: '100%', width: '100%'}}>
					<Typography variant="h1" sx={{fontSize: '2rem'}}>
						Ridership Changes per Month
					</Typography>
					<Typography>
						Month to month diff calculated based on cumulative ridership values
						per line, per station
					</Typography>
					<LineChart
						tooltip={{trigger: 'item'}}
						xAxis={[
							{
								// this feels dumb
								data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
								label: 'Month',
								valueFormatter: (idx) => monthLabels[idx],
							},
						]}
						series={data}
						ref={chartRef}
					/>
				</Stack>
			)}
		</div>
	);
};
