import { Dialog, DialogTitle, List, ListItem } from '@mui/material';

const CovidDataInfoDialog: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({open, onClose}) => {
	return (
		<Dialog
			className="basic-modal"
			title="COVID-19 Data"
			open={open}
			onClose={onClose}
		>
			<DialogTitle>COVID Data Info</DialogTitle>
			<List>
				<ListItem sx={{display: 'block'}}>
					COVID Heatmaps are generated based on NYC DOH Data. Data is reported
					as the average number of cases per zipcode, per 100,000 people, per
					week.
					<List>
						<ListItem>
							<a
								target="_blank"
								rel="noreferrer"
								href="https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/trends/caserate-by-modzcta.csv"
							>
								Raw CSV data
							</a>
						</ListItem>
						<ListItem>
							<a
								target="_blank"
								rel="noreferrer"
								href="https://www.nyc.gov/site/doh/covid/covid-19-data.page"
							>
								User-friendly Site
							</a>
						</ListItem>
					</List>
				</ListItem>
				<ListItem>
					The context of the data is shown as week to week. What you are seeing
					are not changes / trends week to week, but zipcodes' relation to one
					another within a given week.
				</ListItem>
				<ListItem>
					Trends can be observed over time using the animation feature.
				</ListItem>
				<ListItem>
					Heatmap colors may shift unexpectedly due to changes in the number of
					cases and distributions across the city. In other words, per week, if
					there are more cases, but greater distribution, heatmaps may look less
					intense.
				</ListItem>
				<ListItem sx={{display: 'block'}}>
					Heatmaps are drawn as concentric gradients, localized to zip codes (as{' '}
					<a href="https://data.cityofnewyork.us/Health/Modified-Zip-Code-Tabulation-Areas-MODZCTA-/pri4-ifjk/about_data">
						MODZCTA
					</a>
					).
				</ListItem>
				<ListItem>
					Zooming-in provides higher fidelity of the 177 some-odd zip codes.
				</ListItem>
				<ListItem>
					The pin-marker indicates the zipcode(s) that reported the maximum case
					count for that week.
				</ListItem>
			</List>
		</Dialog>
	);
};
export default CovidDataInfoDialog;
