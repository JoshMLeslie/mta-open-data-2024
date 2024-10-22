import {
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { NYC_Borough } from '../../@types/mta-api';
import {
	MagnitudeShift,
	MagnitudeShiftTracking,
	prettyPrintRidership,
} from '../../util/mta-chart';

const dataGridColumns: GridColDef<MagnitudeShift>[] = [
	{field: 'stop', headerName: 'Stop'},
	{
		field: 'date',
		headerName: 'Date',
		valueFormatter: (d) =>
			new Date(d).toLocaleDateString(undefined, {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}),
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
	{
		field: 'magAdjRidership',
		headerName: 'Mag. Adj. Ridership',
		valueFormatter: (r) => prettyPrintRidership(r),
	},
	{
		field: 'magAdjDiff',
		headerName: 'Adj. Diff',
		valueFormatter: (r) => prettyPrintRidership(r),
	},
];

interface Props {
	dataManipulatedDialogOpen: boolean;
	closeDataManipulatedDialog: () => void;
	selectedBorough: NYC_Borough | 'all';
	magShiftTracking?: MagnitudeShiftTracking;
}

const MTADataMagnitudeDialog: React.FC<Props> = ({
	dataManipulatedDialogOpen,
	closeDataManipulatedDialog,
	selectedBorough,
	magShiftTracking = [],
}) => {
	return (
		<Dialog
			open={dataManipulatedDialogOpen}
			onClose={closeDataManipulatedDialog}
			className='data-manipulation-dialog'
		>
			<DialogTitle>Data Manipulation List for {selectedBorough}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					The following data manipulations were performed. See 'Ridership Data
					Info' popup for more details.
				</DialogContentText>
				<DataGrid
					columns={dataGridColumns}
					rows={magShiftTracking}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: 5,
							},
						},
					}}
					pageSizeOptions={[5, 10, 20]}
				/>
			</DialogContent>
		</Dialog>
	);
};
export default MTADataMagnitudeDialog;
