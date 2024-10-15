import { Button, Stack, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import './App.scss';
import { AttachedModal } from './components/AttachedModal';
import { MapAnimator } from './components/MapAnimator';
import { MapWrapper } from './components/MapContainer';
import CovidDataInfoDialog from './components/dialogs/CovidDataInfo.dialog';
import MTADataInfoDialog from './components/dialogs/MTADataInfo.dialog';

function App() {
	const [covidModalOpen, setCovidModalOpen] = useState(false);
	const [mtaModalOpen, setMTAModalOpen] = useState(false);
	return (
		<div id="app-container">
			<MapWrapper />
			<Stack sx={{p: '8px 16px'}}>
				<Stack
					direction={{xs: 'column', sm: 'row'}}
					spacing={{sm: 1, md: 4}}
					justifyContent="space-between"
				>
					<Typography align="left">
						This app compares COVID_19 rates against MTA ridership data between
						March 2020 and Today (or until they stop updating the respective
						data). Data is from the NYC Department of Health (DOH) and
						Metropolitan Transportation Authority (MTA). See modals for further
						info.
					</Typography>
					<Stack
						spacing="1"
						justifyContent="center"
						alignItems="center"
						sx={{minWIdth: '180px'}}
					>
						<Button
							onClick={() => setCovidModalOpen(true)}
							sx={{minWidth: 'fit-content'}}
							variant="outlined"
						>
							COVID Data Info
						</Button>
						<Button
							onClick={() => setMTAModalOpen(true)}
							sx={{minWidth: 'fit-content'}}
							variant="outlined"
						>
							Ridership Data Info
						</Button>
					</Stack>
				</Stack>
				<MapAnimator />
			</Stack>
			<AttachedModal />
			<CovidDataInfoDialog
				open={covidModalOpen}
				onClose={() => setCovidModalOpen(false)}
			/>
			<MTADataInfoDialog
				open={mtaModalOpen}
				onClose={() => setMTAModalOpen(false)}
			/>
		</div>
	);
}

export default App;
