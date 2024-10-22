import { Button, Stack, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import '../App.scss';
import { Animator } from '../components/Animator';
import { AttachedModal } from '../components/AttachedModal';
import CovidDataInfoDialog from '../components/dialogs/CovidDataInfo.dialog';
import MTADataInfoDialog from '../components/dialogs/MTADataInfo.dialog';

const InfoContainer = () => {
	const [covidModalOpen, setCovidModalOpen] = useState(false);
	const [mtaModalOpen, setMTAModalOpen] = useState(false);

	return (
		<div id="info-container">
			<Stack justifyContent="space-between">
				<Stack>
					<Typography
						variant="h1"
						sx={{fontSize: {xs: '1.5rem', sm: '2rem', md: '2rem', lg: '3rem'}}}
					>
						NYC Open Data
					</Typography>
					<Typography
						gutterBottom
						variant="h2"
						sx={{
							fontSize: {xs: '1.25rem', sm: '1.5rem', md: '1.5rem', lg: '2rem'},
						}}
					>
						MTA Ridership vs COVID 19 Rates
					</Typography>
					<Typography>
						This app compares COVID 19 rates against MTA ridership data between
						March 2020 and Today (or until they stop updating the respective
						data). Data is from the NYC Department of Health (DOH) and
						Metropolitan Transportation Authority (MTA). See popups for further
						info.
					</Typography>
				</Stack>
				<Stack
					spacing="1"
					direction="row"
					alignItems="center"
					justifyContent="space-around"
					sx={{width: '100%'}}
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
				<Animator />
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
};
export default InfoContainer;
