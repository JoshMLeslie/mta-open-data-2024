import WarningIcon from '@mui/icons-material/Warning';
import {
	Button,
	CircularProgress,
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
import {
	BoroughChartData,
	BoroughChartDatum,
	NYC_Borough,
} from '../@types/mta-api';
import { getChartData } from '../api/mta-chart-api';
import { onDateUpdate } from '../util/events';
import { flattenBoroughChartData, monthLabels } from '../util/mta-chart';
import MTADataMagnitudeDialog from './dialogs/MTADataMagnitude.dialog';
import SegmentLoaderBar from './SegmentLoaderBar';

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
	const [loadingState, setLoadingState] = useState({
		loading: true,
		error: false,
	});
	const [baseData, setBaseData] = useState<BoroughChartData | null>(null);
	const [selectedData, setSelectedData] = useState<BoroughChartDatum | null>(
		null
	);
	const [selectedBorough, setSelectedBorough] = useState<NYC_Borough | 'all'>(
		NYC_Borough.MANHATTAN
	);
	const [dataManipDialogOpen, setDataManipDialogOpen] = useState(false);

	const chartElRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const selectedYearRef = useRef(2020);
	const preloadRef = useRef<Record<string, boolean>>({});

	const preloadData = async (startDate: Date) => {
		getChartData(startDate);
	};

	const loadData = async (startDate: Date) => {
		setLoadingState({loading: true, error: false});
		try {
			const baseData = await getChartData(startDate);
			setBaseData(baseData);
			setSelectedData(baseData[NYC_Borough.MANHATTAN]);
			setLoadingState({loading: false, error: false});
		} catch (e) {
			console.warn('error while loading mta chart data', e);
			setSelectedData(null);
			setLoadingState({loading: false, error: true});
		}
	};

	useEffect(() => {
		console.debug('init mta chart');

		loadData(new Date('2020-01-01'));
		const onDateUpdateUnmount = onDateUpdate(({detail: date}) => {
			const d = new Date(date);
			const incomingYear = d.getUTCFullYear();
			const incomingMonth = d.getUTCMonth();
			const nextYear = incomingYear + 1;

			if (selectedYearRef.current !== incomingYear) {
				loadData(new Date(`${incomingYear}-01-01`));
				selectedYearRef.current = incomingYear;
			} else if (incomingMonth >= 6 && !preloadRef.current[nextYear]) {
				preloadData(new Date(`${nextYear}-01-01`));
				preloadRef.current[nextYear] = true;
			}
		});
		return () => {
			console.log('unmounting');
			onDateUpdateUnmount();
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const updateChart = (selectedData: BoroughChartDatum) => {
		if (!chartElRef.current) {
			console.warn('data loaded without chart element painted');
			return;
		}
		if (chartRef.current) {
			chartRef.current.data.datasets = selectedData.chartData;
			chartRef.current.update();
		} else {
			chartRef.current = new Chart(chartElRef.current, {
				type: 'line',
				options: chartConfig,
				data: {
					labels: monthLabels,
					datasets: selectedData.chartData,
				},
			});
		}
	};

	useEffect(() => {
		if (!selectedData) {
			return;
		}
		updateChart(selectedData);
	}, [selectedData]);

	const handleBoroughChange = (e: SelectChangeEvent) => {
		const borough = e.target.value as NYC_Borough | 'all';
		setSelectedBorough(borough);
		if (borough === 'all') {
			const allBoroughs = flattenBoroughChartData(baseData!);
			setSelectedData(allBoroughs);
		} else {
			setSelectedData(baseData![borough]);
		}
	};

	return (
		<>
			<div id="mta-chart-container">
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
								onClick={() => setDataManipDialogOpen(true)}
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
						Month to month diff calculated based on cumulative ridership values
						per line, per station. Positive slopes indicate increase in
						ridership, negative slope indicates decrease. Zero values indicate
						no ridership for that time period. Diffs between years are ignored
						due to the volume of data and storage complexity involved. May be
						revisited in future versions.
					</Typography>
					<Typography pt={1} pb={1}>
						NB: Selecting "all" boroughs may provide a poor experience due to
						the sheer volume of data, some 450+ stations.
					</Typography>
					{loadingState.loading && !loadingState.error && (
						<Stack
							sx={{margin: '0 auto'}}
							justifyContent="center"
							alignItems="center"
						>
							<Stack
								justifyContent="center"
								alignItems="center"
								direction="row"
							>
								<h2 style={{marginRight: '2rem'}}>
									Loading... May take several minutes depending on connection
								</h2>
								<CircularProgress />
							</Stack>
							<SegmentLoaderBar />
						</Stack>
					)}
					{!loadingState.loading && loadingState.error && (
						<h2>Error loading data</h2>
					)}
					<canvas
						id="ridership-chart"
						ref={chartElRef}
						style={{
							display:
								!loadingState.loading && !loadingState.error ? 'block' : 'none',
						}}
					></canvas>
				</Stack>
			</div>
			<MTADataMagnitudeDialog
				dataManipulatedDialogOpen={dataManipDialogOpen}
				closeDataManipulatedDialog={() => setDataManipDialogOpen(false)}
				selectedBorough={selectedBorough}
				magShiftTracking={selectedData?.magShiftTracking}
			/>
		</>
	);
};
