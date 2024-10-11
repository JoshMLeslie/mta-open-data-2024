import {
	Box,
	Button,
	List,
	ListItem,
	Modal,
	Stack,
	Typography
} from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import './App.scss';
import { AttachedModal } from './components/AttachedModal';
import { MapAnimator } from './components/MapAnimator';
import { MapWrapper } from './components/MapContainer';

const CovidDataInfoModal: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({open, onClose}) => {
	return (
		<Modal
			className="basic-modal"
			title="COVID-19 Data"
			open={open}
			onClose={onClose}
		>
			<Box>
				<List>
					<ListItem sx={{display: 'block'}}>
						COVID Heatmaps are generated based on{' '}
						<a href="'https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/trends/caserate-by-modzcta.csv'">
							NYC Health's Data
						</a>
						: the average number of cases per 100,000, per week.
					</ListItem>
					<ListItem>
						Week to week may have different heatmap colors due to changes in the
						number of cases and distributions.
					</ListItem>
					<ListItem>
						Heatmaps may look less intense if there is a greater distribution.
					</ListItem>
					<ListItem sx={{display: 'block'}}>
						Heatmaps are localized to match zip codes (in the format of{' '}
						<a href="https://data.cityofnewyork.us/Health/Modified-Zip-Code-Tabulation-Areas-MODZCTA-/pri4-ifjk/about_data">
							MODZCTA
						</a>
						).
					</ListItem>
					<ListItem>
						Zooming-in provides higher fidelity of the 177 some-odd zip codes.
					</ListItem>
				</List>
			</Box>
		</Modal>
	);
};

const MTADataInfoModal: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({open, onClose}) => {
	return (
		<Modal
			className="basic-modal"
			title="MTA Ridership Data"
			open={open}
			onClose={onClose}
		>
			<Box>
				<List>
					<ListItem sx={{display: 'block'}}>
						COVID Heatmaps are generated based on{' '}
						<a href="'https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/trends/caserate-by-modzcta.csv'">
							NYC Health's Data
						</a>
						: the average number of cases per 100,000, per week.
					</ListItem>
					<ListItem>
						Week to week may have different heatmap colors due to changes in the
						number of cases and distributions.
					</ListItem>
					<ListItem>
						Heatmaps may look less intense if there is a greater distribution.
					</ListItem>
					<ListItem sx={{display: 'block'}}>
						Heatmaps are localized to match zip codes (in the format of{' '}
						<a href="https://data.cityofnewyork.us/Health/Modified-Zip-Code-Tabulation-Areas-MODZCTA-/pri4-ifjk/about_data">
							MODZCTA
						</a>
						).
					</ListItem>
					<ListItem>
						Zooming-in provides higher fidelity of the 177 some-odd zip codes.
					</ListItem>
				</List>
			</Box>
		</Modal>
	);
};

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
						START and END. Data is from the NYC Department of Health (DOH) and
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
						>
							COVID Data Info
						</Button>
						<Button
							onClick={() => setMTAModalOpen(true)}
							sx={{minWidth: 'fit-content'}}
						>
							Ridership Data Info
						</Button>
					</Stack>
				</Stack>
				<MapAnimator />
			</Stack>
			<AttachedModal />
			<CovidDataInfoModal
				open={covidModalOpen}
				onClose={() => setCovidModalOpen(false)}
			/>
			<MTADataInfoModal
				open={mtaModalOpen}
				onClose={() => setMTAModalOpen(false)}
			/>
		</div>
	);
}

export default App;
