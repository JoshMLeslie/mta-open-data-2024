import WarningIcon from '@mui/icons-material/Warning';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	Checkbox,
	CircularProgress,
	FormControl,
	FormControlLabel,
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
	const [dataManipDialogLoading, setDataManipDialogLoading] = useState(false);
	const [dataManipDialogOpen, setDataManipDialogOpen] = useState(false);
	const [useAverageYMax, setUseAverageYMax] = useState(true);

	const chartElRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const selectedYearRef = useRef(2020);
	const selectedMonthRef = useRef(1);
	const preloadRef = useRef<Record<string, boolean>>({});
	const averageYMaxRef = useRef(0);

	const preloadData = async (startDate: Date) => {
		getChartData(startDate);
	};

	const loadData = async (startDate: Date) => {
		setLoadingState({loading: true, error: false});
		try {
			const baseData = await getChartData(startDate);
			if (!baseData) {
				setLoadingState({loading: false, error: false});
				return;
			}
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
		setDataManipDialogOpen(dataManipDialogLoading);
	}, [dataManipDialogLoading]);

	const selectMonthOnChart = (drawMonth: number) => {
		if (!chartRef) {
			return;
		}
	};

	useEffect(() => {
		console.debug('init mta chart');

		loadData(new Date('2020-01-01'));
		const unmountDateUpdate = onDateUpdate(({detail: date}) => {
			const now = new Date();
			const d = new Date(date);
			const incomingYear = d.getUTCFullYear();
			const incomingMonth = d.getUTCMonth() + 1; // 1-indexed months
			const nextYear = incomingYear + 1;

			if (selectedYearRef.current !== incomingYear) {
				loadData(new Date(`${incomingYear}-01-01`));
				selectedYearRef.current = incomingYear;
			}
			if (selectedMonthRef.current !== incomingMonth) {
				selectedMonthRef.current = incomingMonth;
				selectMonthOnChart(incomingMonth);
			}

			if (
				incomingMonth >= 3 &&
				nextYear <= now.getFullYear() &&
				!preloadRef.current[nextYear]
			) {
				preloadData(new Date(`${nextYear}-01-01`));
				preloadRef.current[nextYear] = true;
			}
		});
		return () => {
			console.log('unmounting');
			unmountDateUpdate();
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const updateChart = (selectedData: BoroughChartDatum) => {
		if (!chartElRef.current) {
			console.warn('data loaded without chart element painted');
			return;
		}
		// get current chart avg to cut off errant high values
		const chartYMax = selectedData.chartData.reduce((acc, station) => {
			const stationTotal = station.data.reduce(
				(ac, v) => (v ? (ac! += v) : ac),
				0
			);
			return stationTotal ? Math.max(acc, stationTotal / 11) : acc;
		}, 0);

		averageYMaxRef.current = chartYMax;

		if (chartRef.current) {
			chartRef.current.data.datasets = selectedData.chartData;
			if (useAverageYMax) {
				chartRef.current.options!.scales!.y!.max = chartYMax;
			}
			chartRef.current.update();
		} else {
			chartRef.current = new Chart(chartElRef.current, {
				type: 'line',
				options: {
					...chartConfig,
					scales: {
						y: {
							max: chartYMax,
						},
					},
				},
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
	}, [selectedData]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!chartRef.current) {
			return;
		}
		if (useAverageYMax) {
			chartRef.current.options!.scales!.y!.max = averageYMaxRef.current;
		} else {
			chartRef.current.options!.scales!.y!.max = undefined;
		}
		chartRef.current.update();
	}, [useAverageYMax]);

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
						<FormControlLabel
							sx={{
								border: '1px solid rgba(0, 0, 0, .25)',
								margin: 0,
								padding: '0 8px',
								borderRadius: '4px',
								textAlign: 'center',
							}}
							label="Use Avg Y&nbsp;Max"
							labelPlacement="bottom"
							control={
								<Checkbox
									checked={useAverageYMax}
									onChange={(e) => setUseAverageYMax(e.target.checked)}
								/>
							}
						/>
						{!!selectedData?.magShiftTracking.length && (
							<LoadingButton
								loading={dataManipDialogLoading}
								sx={{height: '100%'}}
								variant="outlined"
								aria-label="notice"
								startIcon={<WarningIcon />}
								onClick={() => setDataManipDialogLoading(true)}
							>
								Data Adjusted
							</LoadingButton>
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
						NB: Selecting "all" boroughs is dicey due to the 450+ stations.
					</Stack>
					<Typography pt={1}>
						Month to month diff calculated based on cumulative ridership values
						per line, per station. Positive slopes indicate increase in
						ridership, negative slope indicates decrease. Zero values indicate
						no ridership for that time period. Diffs between years are ignored
						due to the volume of data and storage complexity involved. May be
						revisited in future versions. The chart Y-Max is set to the average
						for that borough, to cut off the wild values that sneak thru.
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
				closeDataManipulatedDialog={() => setDataManipDialogLoading(false)}
				selectedBorough={selectedBorough}
				magShiftTracking={selectedData?.magShiftTracking}
			/>
		</>
	);
};
