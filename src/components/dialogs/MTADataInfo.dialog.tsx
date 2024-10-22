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
					For the years 2020, '21, and '22, the exit numbers reported{' '}
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
				<ListItem sx={{display: 'block'}}>
					The following URLs, via https://data.ny.gov/Transportation, are used
					to fetch the data, leveraging offset / limits to paginate requests -
					urls open in a new page:
					<ul style={{marginTop: "8px"}}>
						<li>
							2020 - Data set ID:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://data.ny.gov/resource/py8k-a8wg.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222020-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222020-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20100%0AOFFSET%200&;"
							>
								py8k-a8wg
							</a>
						</li>
						<li>
							2021 - Data set ID:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://data.ny.gov/resource/uu7b-3kff.json?$query=SELECT%0A%20%20%60station%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%222021-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222021-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%20%60station%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60station%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20100%0AOFFSET%200&;"
							>
								uu7b-3kff
							</a>
						</li>
						<li>
							2022 - Data set ID:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://data.ny.gov/resource/k7j9-jnct.json?$query=SELECT%0A%20%20%60unit%60%2C%0A%20%20%60line_name%60%2C%0A%20%20date_trunc_ym(%60date%60)%20AS%20%60by_month_date%60%2C%0A%20%20avg(%60exits%60)%20AS%20%60avg_exits%60%0AGROUP%20BY%20%60unit%60%2C%20%60line_name%60%2C%20date_trunc_ym(%60date%60)%0AORDER%20BY%0A%20%20%60unit%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60line_name%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60date%60)%20ASC%20NULL%20FIRST%0ALIMIT%20100%0AOFFSET%200&;"
							>
								k7j9-jnct
							</a>
						</li>
						<li>
							2023 - Data set ID:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222023-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222023-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0AORDER%20BY%0A%20%20%60station_complex%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60borough%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20ASC%20NULL%20FIRST%0ALIMIT%20100%0AOFFSET%200&;"
							>
								wujg-7c2s
							</a>
						</li>
						<li>
							2024 - Data set ID:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://data.ny.gov/resource/wujg-7c2s.json?$query=SELECT%0A%20%20%60station_complex%60%2C%0A%20%20avg(%60ridership%60)%20AS%20%60avg_ridership%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20AS%20%60by_month_transit_timestamp%60%0AWHERE%0A%20%20%60transit_timestamp%60%0A%20%20%20%20BETWEEN%20%222024-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%222024-12-31T23%3A45%3A00%22%20%3A%3A%20floating_timestamp%0AGROUP%20BY%0A%20%20%60station_complex%60%2C%0A%20%20%60borough%60%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%0AORDER%20BY%0A%20%20%60station_complex%60%20ASC%20NULL%20FIRST%2C%0A%20%20%60borough%60%20ASC%20NULL%20FIRST%2C%0A%20%20date_trunc_ym(%60transit_timestamp%60)%20ASC%20NULL%20FIRST%0ALIMIT%20100%0AOFFSET%200&;"
							>
								wujg-7c2s
							</a>
						</li>
					</ul>
				</ListItem>
			</List>
		</Dialog>
	);
};
export default MTADataInfoDialog;
