import { Dialog, DialogTitle, List, ListItem } from '@mui/material';

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
				<ListItem sx={{display: 'block'}}>
					Year 2020: The exit numbers reported{' '}
					<a
						target="_blank"
						rel="noreferrer"
						href="https://data.ny.gov/Transportation/MTA-Subway-Turnstile-Usage-Data-2020/py8k-a8wg/about_data"
					>
						per the data portal
					</a>
					, are defined as cumulative, but straight processing returns
					occasional negative values which makes me think that when the
					reporting device is (re)initialized, the value can change arbitrarily:
					more or less than the previous month's reported value. For argument's
					sake, going to clamp to positive values for now.
				</ListItem>
				<ListItem sx={{display: 'block'}}>
					Continuing on "reinitialized value changes wildly" theory: The next
					issue with the data encountered is wild jumps by several magnitude,
					e.g. 2m to 40m riders or 40m to 400m between two months, which is
					itself alarming and makes me think someone is off by a base 10, but
					also how the average diff returns to pre-jump value. e.g. c.2020, 191
					st - 1 line:
					<pre>
						<code>
							{`2201876.13, 2211228.7, 2214287.51, 2216439.42, 2219777.5,
43689640.95,
404631069.6, 403315618.87, 403322207.98, 404320347.18, 403762079.77`}
						</code>
					</pre>
				</ListItem>
			</List>
		</Dialog>
	);
};
export default MTADataInfoDialog;
