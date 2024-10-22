import WarningIcon from '@mui/icons-material/Warning';
import {
	Button,
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
	ChartOptions,
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
import { onDateUpdate } from '../util/events';
import {
	BoroughChartData,
	BoroughChartDatum,
	flattenBoroughChartData,
	monthLabels,
} from '../util/mta-chart';
import MTADataMagnitudeDialog from './dialogs/MTADataMagnitude.dialog';

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

const chartConfig: ChartOptions = {
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
};

export const MTAChart = () => {
	const [loading, setLoading] = useState(false);
	const [baseData, setBaseData] = useState<BoroughChartData>({});
	const [selectedData, setSelectedData] = useState<BoroughChartDatum>();
	const [selectedBorough, setSelectedBorough] = useState<NYC_Borough | 'all'>(
		NYC_Borough.MANHATTAN
	);
	const [dataManipulatedDialogOpen, setDataManipulatedDialogOpen] =
		useState(false);

	const chartElRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const selectedYearRef = useRef(2020);

	const loadData = async (startDate: Date) => {
		try {
			const boroughData = await getChartData(startDate);
			setBaseData(boroughData);
			setSelectedData(boroughData[NYC_Borough.MANHATTAN]);
		} catch (e) {
			setBaseData({});
			setSelectedData(undefined);
			console.warn('error while loading mta chart data', e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		console.debug('init mta chart');
		setLoading(true);
		loadData(new Date('2020-01-01'));
		const onDateUpdateUnmount = onDateUpdate(({detail: date}) => {
			const updateYear = new Date(date).getUTCFullYear();
			if (selectedYearRef.current !== updateYear) {
				loadData(new Date(`${updateYear}-01-01`));
				selectedYearRef.current = updateYear;
			}
		});
		return () => {
			onDateUpdateUnmount();
		};
	}, []);

	useEffect(() => {
		if (!selectedData) {
			return;
		}
		if (!chartElRef.current) {
			console.warn('data loaded without chart element painted');
			return;
		}
		if (chartRef.current) {
			chartRef.current.data.datasets = selectedData.chartData;
			chartRef.current.update();
			return;
		}
		chartRef.current = new Chart(chartElRef.current, {
			type: 'line',
			options: chartConfig,
			data: {
				labels: monthLabels,
				datasets: selectedData.chartData,
			},
		});
	}, [selectedData]);

	const handleBoroughChange = (e: SelectChangeEvent) => {
		const borough = e.target.value as NYC_Borough | 'all';
		setSelectedBorough(borough);
		if (borough === 'all') {
			const allBoroughs = Object.values(baseData).reduce<BoroughChartDatum>(
				(acc, boroughData) => {
					return {
						chartData: [...acc.chartData, ...boroughData.chartData],
						magShiftTracking: [
							...acc.magShiftTracking,
							...boroughData.magShiftTracking,
						],
					};
				},
				{chartData: [], magShiftTracking: []}
			);
			console.log(allBoroughs);
			const allBoroughs = flattenBoroughChartData(baseData!);
			setSelectedData(allBoroughs);
		} else {
			setSelectedData(baseData[borough]);
		}
	};

	const openDataManipulatedDialog = () => {
		setDataManipulatedDialogOpen(true);
	};
	const closeDataManipulatedDialog = () => {
		setDataManipulatedDialogOpen(false);
	};

	return (
		<>
			<div id="mta-chart-container">
				{!selectedData && loading && <h2>Loading</h2>}
				{!selectedData && !loading && <h2>Error loading data</h2>}
				{selectedData && (
					<Stack sx={{height: '100%', width: '100%'}}>
						<Stack direction="row" alignItems="center" sx={{gap: '8px'}}>
							<Typography variant="h1" sx={{fontSize: '2rem'}}>
								Ridership Changes per Month
							</Typography>
							{!!selectedData?.magShiftTracking.length && (
								<Button
									sx={{height: '100%'}}
									variant="outlined"
									aria-label="notice"
									startIcon={<WarningIcon />}
									onClick={openDataManipulatedDialog}
								>
									Data Adjusted
								</Button>
							)}
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
									<MenuItem key={'all'} value={'all'}>
										All
									</MenuItem>
									{Object.values(NYC_Borough).map((b) => (
										<MenuItem key={b} value={b}>
											{b}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>
						<Typography pt={1}>
							Month to month diff calculated based on cumulative ridership
							values per line, per station.
						</Typography>
						<Typography pb={1}>
							Positive slopes indicate increase in ridership, negative slope
							indicates decrease. Zero values indicate no ridership for that
							time period.
						</Typography>
						<Typography pb={1}>
							NB. Selecting "all" boroughs may provide a poor experience due to
							the sheer volume of data, some 450+ stations.
						</Typography>
						<canvas id="ridership-chart" ref={chartElRef}></canvas>
					</Stack>
				)}
			</div>
			<MTADataMagnitudeDialog
				dataManipulatedDialogOpen={dataManipulatedDialogOpen}
				closeDataManipulatedDialog={closeDataManipulatedDialog}
				magShiftTracking={selectedData?.magShiftTracking}
			/>
		</>
	);
};
