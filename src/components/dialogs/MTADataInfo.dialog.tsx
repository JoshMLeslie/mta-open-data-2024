import { Dialog, DialogTitle, List, ListItem } from "@mui/material";

const MTADataInfoDialog: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({open, onClose}) => {
	return (
		<Dialog
			className="basic-modal"
			title="MTA Ridership Data"
			open={open}
			onClose={onClose}
		>
			<DialogTitle>MTA Data Info</DialogTitle>
			<List>
				<ListItem>todo</ListItem>
			</List>
		</Dialog>
	);
};
export default MTADataInfoDialog;
