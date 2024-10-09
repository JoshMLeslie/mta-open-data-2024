import { Box, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { onModalMessage } from '../util/events';

export const AttachedModal = () => {
	const [message, setMessage] = useState('');

	onModalMessage(({detail}) => setMessage(detail));

	return (
		<Modal
			className="basic-modal"
			open={!!message}
			onClose={() => setMessage('')}
		>
			<Box>
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
