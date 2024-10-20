import WarningIcon from '@mui/icons-material/Warning';
import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
import { getChartData, GetChartDataReturn } from '../api/mta-chart-api';
import { onDateUpdate } from '../util/events';
import {
	MagnitudeShift,
	monthLabels,
	prettyPrintRidership,
} from '../util/mta-chart';

const dataGridColumns: GridColDef<MagnitudeShift>[] = [
	{field: 'stop', headerName: 'Stop'},
	{
		field: 'date',
		headerName: 'Date',
		valueFormatter: (d) => new Date(d).toLocaleDateString(),
	},
	{
		field: 'currentRidership',
		headerName: 'Date Ridership',
		valueFormatter: (r) => prettyPrintRidership(r),
	},
	{
		field: 'prevRidership',
		headerName: 'Prev. Date Ridership',
		valueFormatter: (r) => prettyPrintRidership(r),
	},
	{field: 'magnitude', headerName: 'Magnitude'},
	{field: 'magAdjDiff', headerName: 'Adj. Diff'},
	{
		field: 'magAdjRidership',
		headerName: 'Mag. Adj. Ridership',
		valueFormatter: (r) => prettyPrintRidership(r),
	},
];

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
	const [baseData, setBaseData] = useState<GetChartDataReturn>({});
	const [selectedData, setSelectedData] =
		useState<GetChartDataReturn[string]>();
	const [selectedBorough, setSelectedBorough] = useState(NYC_Borough.MANHATTAN);
	const [dataManipulatedDialogOpen, setDataManipulatedDialogOpen] =
		useState(false);

	const chartElRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const selectedYearRef = useRef(2020);

	/**
	 * @param startDate string in the format YYYY-MM-DD
	 */
	const loadData = async (startDate: Date) => {
		try {
			const boroughData = await getChartData(startDate);
			setBaseData(boroughData);
			setSelectedData(boroughData[NYC_Borough.MANHATTAN]);
		} catch (e) {
			console.warn('error while loading mta chart data', e);
		}
	};

	useEffect(() => {
		console.debug('init mta chart');
		loadData(new Date('2020-01-01'));
		const onDateUpdateUnmount = onDateUpdate(({detail: date}) => {
			const updateYear = new Date(date).getUTCFullYear();
			if (selectedYearRef.current !== updateYear) {
				console.log(updateYear);
				loadData(new Date(`${updateYear}-01-01`));
				selectedYearRef.current = updateYear;
			}
		});
		return () => {
			onDateUpdateUnmount();
		};
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
			chartRef.current.data.datasets = selectedData.chartData;
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
				datasets: selectedData.chartData,
			},
		});
	}, [selectedData]);

	const handleBoroughChange = (e: SelectChangeEvent) => {
		const borough = e.target.value as NYC_Borough;
		setSelectedBorough(borough);
		setSelectedData(baseData[borough]);
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
				{!selectedData && <h2>Loading</h2>}
				{selectedData && (
					<Stack sx={{height: '100%', width: '100%'}}>
						<Stack direction="row" alignItems="center" sx={{p: 1, gap: '8px'}}>
							<Typography variant="h1" sx={{fontSize: '2rem'}}>
								Ridership Changes per Month
							</Typography>
							<Button
								aria-label="notice"
								startIcon={<WarningIcon />}
								onClick={openDataManipulatedDialog}
							>
								Data Adjusted
							</Button>
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
							Month to month diff calculated based on cumulative ridership
							values per line, per station. Positive slopes indicate increase in
							ridership, negative slope indicates decrease. Zero values indicate
							no ridership for that time period.
						</Typography>
						<Typography>WIP: MTA data only setup for 2020 currently</Typography>

						<canvas id="ridership-chart" ref={chartElRef}></canvas>
					</Stack>
				)}
			</div>
			<Dialog
				open={dataManipulatedDialogOpen}
				onClose={closeDataManipulatedDialog}
			>
				<DialogTitle>Data Manipulation List</DialogTitle>
				<DialogContent>
					<DialogContentText>
						The following data manipulations were performed. See 'Ridership Data
						Info' popup for more details.
					</DialogContentText>
					<DataGrid
						columns={dataGridColumns}
						rows={selectedData?.magShiftTracking}
						initialState={{
							pagination: {
								paginationModel: {
									pageSize: 5,
								},
							},
						}}
						pageSizeOptions={[5, 10, 20]}
					></DataGrid>
				</DialogContent>
			</Dialog>
		</>
	);
};
