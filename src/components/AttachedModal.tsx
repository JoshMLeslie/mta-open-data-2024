import { Box, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { onModalMessage } from '../util/events';

const modalContentStyle = {
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};
export const AttachedModal = () => {
	const [message, setMessage] = useState('');

	onModalMessage(({detail}) => setMessage(detail));

	return (
		<Modal
			open={!!message}
			onClose={() => setMessage('')}
			sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
		>
			<Box sx={modalContentStyle}>
				<Typography variant="h6" component="h2">
					Notice
				</Typography>
				<Typography sx={{mt: 2}}>{message}</Typography>
				<Typography sx={{mt: 2}}>
					Click anywhere outside of this box to close.
				</Typography>
			</Box>
		</Modal>
	);
};
