import {
	TurnstileData,
	TurnstileDataFeb2022,
	TurnstileDataUnit,
	UnitToStation,
} from '../@types/mta-api';

type CTOR_DATA_TYPE = Partial<TurnstileData> &
	Partial<TurnstileDataFeb2022> &
	Partial<TurnstileDataUnit>;

export const standardizeMTA_API_Data = (
	data: CTOR_DATA_TYPE,
	unitStationMap?: UnitToStation
): TurnstileData => {
	let line_name = '';
	let station = '';

	if (data.station_complex) {
		const matched = data.station_complex.match(/(.+)\s\((.+)\)/);
		if (matched) {
			matched.shift();
			[line_name, station] = matched;
		}
		
		if (!line_name || !station) {
			console.warn("Couldn't generate station or line from complex", {
				sc: data.station_complex,
				line_name,
				station,
			});
		}
		line_name = line_name?.trim();
		station = station?.trim();
	} else if (data?.unit && unitStationMap && data.line_name) {
		station = unitStationMap[data.unit];
		line_name = data.line_name;
	} else if (data.line_name && data.station) {
		line_name = data.line_name;
		station = data.station;
	} else {
		console.error(data, unitStationMap);
		throw new Error('Invalid MTA datum, missing station and line');
	}

	let avg_exits = data?.avg_exits || '0';
	if (data?.avg_ridership) {
		avg_exits = `${+data.avg_ridership * 24 * 30}`; // per hour => per month
	}

	const by_month_date =
		data?.by_month_date || data?.by_month_transit_timestamp || '';

	return {
		avg_exits,
		by_month_date,
		station,
		line_name,
	};
};
