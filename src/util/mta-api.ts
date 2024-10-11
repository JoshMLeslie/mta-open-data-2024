import { BASE_SELECT_DATA, ColumnsForViewWithQuery } from '../@types/mta-api';
const weekInMs = 518400000; // 6 * 24 * 60 * 60 * 1000;

const getBaseSelectUrl = (startDate: string, endDate: string) => {
	return `https://data.ny.gov/resource/vxuj-8kew.json?$query=SELECT%0A%20%20%60date%60%2C%0A%20%20%60subways_total_estimated_ridership%60%2C%0A%20%20%60subways_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60buses_total_estimated_ridersip%60%2C%0A%20%20%60buses_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60lirr_total_estimated_ridership%60%2C%0A%20%20%60lirr_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60metro_north_total_estimated_ridership%60%2C%0A%20%20%60metro_north_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60access_a_ride_total_scheduled_trips%60%2C%0A%20%20%60access_a_ride_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60bridges_and_tunnels_total_traffic%60%2C%0A%20%20%60bridges_and_tunnels_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60staten_island_railway_total_estimated_ridership%60%2C%0A%20%20%60staten_island_railway_of_comparable_pre_pandemic_day%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%22${startDate}%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%22${endDate}%22%20%3A%3A%20floating_timestamp%0AORDER%20BY%20%60date%60%20ASC%20NULL%20LAST%0ALIMIT%20100%0AOFFSET%200&`;
};
const getColumnsURL = (startDate: string, endDate: string) => {
	return `https://data.ny.gov/views/vxuj-8kew.json?method=getColumnsForViewWithQuery&columnBaseUid=vxuj-8kew&query=SELECT%0A%20%20%60date%60%2C%0A%20%20%60subways_total_estimated_ridership%60%2C%0A%20%20%60subways_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60buses_total_estimated_ridersip%60%2C%0A%20%20%60buses_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60lirr_total_estimated_ridership%60%2C%0A%20%20%60lirr_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60metro_north_total_estimated_ridership%60%2C%0A%20%20%60metro_north_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60access_a_ride_total_scheduled_trips%60%2C%0A%20%20%60access_a_ride_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60bridges_and_tunnels_total_traffic%60%2C%0A%20%20%60bridges_and_tunnels_of_comparable_pre_pandemic_day%60%2C%0A%20%20%60staten_island_railway_total_estimated_ridership%60%2C%0A%20%20%60staten_island_railway_of_comparable_pre_pandemic_day%60%0AWHERE%0A%20%20%60date%60%0A%20%20%20%20BETWEEN%20%22${startDate}%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20AND%20%22${endDate}%22%20%3A%3A%20floating_timestamp%0AORDER%20BY%20%60date%60%20ASC%20NULL%20LAST&`;
};

const timeDropMs = (t: string) => t.split(/\.\d{3}Z/)[0];

// week, inclusive start, exclusive end.
export const getWeekDataByDate = (
	startDate: Date
): Promise<[BASE_SELECT_DATA, ColumnsForViewWithQuery]> => {
	const endDate = new Date(startDate.getTime() + weekInMs);

	const urlStartdate = encodeURIComponent(timeDropMs(startDate.toISOString()));
	const urlEndDate = encodeURIComponent(timeDropMs(endDate.toISOString()));

	const baseSelectURL = getBaseSelectUrl(urlStartdate, urlEndDate);
	const columnsURL = getColumnsURL(urlStartdate, urlEndDate);

	return Promise.all([
		fetch(baseSelectURL).then((res) => res.json()),
		fetch(columnsURL).then((res) => res.json()),
	]).then((v) => {
		console.log(v);
		return v;
	});
};

/*
SELECT
  `date`,
  `subways_total_estimated_ridership`,
  `subways_of_comparable_pre_pandemic_day`,
  `buses_total_estimated_ridersip`,
  `buses_of_comparable_pre_pandemic_day`,
  `lirr_total_estimated_ridership`,
  `lirr_of_comparable_pre_pandemic_day`,
  `metro_north_total_estimated_ridership`,
  `metro_north_of_comparable_pre_pandemic_day`,
  `access_a_ride_total_scheduled_trips`,
  `access_a_ride_of_comparable_pre_pandemic_day`,
  `bridges_and_tunnels_total_traffic`,
  `bridges_and_tunnels_of_comparable_pre_pandemic_day`,
  `staten_island_railway_total_estimated_ridership`,
  `staten_island_railway_of_comparable_pre_pandemic_day`
WHERE
  `date`
    BETWEEN "2020-03-07T12:08:33" :: floating_timestamp
    AND "2020-03-14T12:08:33" :: floating_timestamp
|>
SELECT count(*) AS `__explore_count_name__`&'
*/
