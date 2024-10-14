import { LatLngBoundsLiteral } from 'leaflet';
import { BAT_ID, BridgeAndTunnelData, BridgeAndTunnelRes } from '../@types/mta-api';

const weekInMs = 604799999; // (7 * 24 * 60 * 60 * 1000) - 1ms


const getBridgeAndTunnelTrafficDataUrl = (
	startDate: string,
	endDate: string
) => {
	return `https://data.ny.gov/resource/qzve-kjga.json?$query=SELECT%0A%20%20%60
	plaza_id%60%2C%0A%20%20%60
	direction%60%2C%0A%20%20
	median(%60vehicles_e_zpass%60)%20AS%20%60
	median_vehicles_e_zpass%60%2C%0A%20%20
	median(%60vehicles_vtoll%60)%20AS%20%60
	median_vehicles_vtoll%60%0A
	WHERE%0A%20%20%60
	date%60%0A%20%20%20%20
	BETWEEN%20%22
	${startDate}%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20
	AND%20%22
	${endDate}%22%20%3A%3A%20floating_timestamp%0A
	GROUP%20BY%20%60plaza_id%60%2C%20%60direction%60%0AORDER%20BY%20%60plaza_id%60%20ASC%20NULL%20LAST%0ALIMIT%20100%0AOFFSET%200&
`;
};

// ripped from MTA data portal
export const BATNameMap: Record<BAT_ID, string> = {
	'21': 'Robert F. Kennedy Bridge Bronx Plaza and Queens Plaza',
	'22': 'Robert F. Kennedy Bridge Manhattan Plaza',
	'23': 'Bronx-Whitestone Bridge',
	'24': 'Henry Hudson Bridge',
	'25': 'Marine Parkway-Gil Hodges Memorial Bridge',
	'26': 'Cross Bay Veterans Memorial Bridge',
	'27': 'Queens Midtown Tunnel',
	'28': 'Hugh L. Carey Tunnel',
	'29': 'Throgs Neck Bridge',
	'30': 'Verrazano-Narrows Bridge',
};
export const BATShortNameMap: Record<BAT_ID, string> = {
	'21': 'TBX',
	'22': 'TBM',
	'23': 'BWB',
	'24': 'HHB',
	'25': 'MPB',
	'26': 'CBB',
	'27': 'QMT',
	'28': 'HCT',
	'29': 'TNB',
	'30': 'VNB',
};
export const BATDirTravelMap = {
	I: {
		TBX: 'Manhattan, Queens, Bronx',
		BWB: 'The Bronx',
		HHB: 'Manhattan',
		MPB: 'Rockaways',
		CBB: 'Rockaways',
		QMT: 'Manhattan',
		HCT: 'Manhattan',
		TNB: 'The Bronx',
		VNB: 'Brooklyn',
	},
	O: {
		TBM: 'Bronx, Queens',
		BWB: 'Queens',
		HHB: 'The Bronx',
		MPB: 'Brooklyn',
		CBB: 'Queens',
		QMT: 'Queens',
		HCT: 'Brooklyn',
		TNB: 'Queens',
		VNB: 'Staten Island',
	},
};
export const NYCBridgeAndTunnelBounds: Record<BAT_ID, LatLngBoundsLiteral> = {
	'21': [
		[40.8015, -73.9298],
		[40.7721, -73.9225],
	],
	'22': [
		[40.7806, -73.9336],
		[40.78, -73.9426],
	],
	'23': [
		[40.8282, -73.8357],
		[40.7895, -73.8331],
	],
	'24': [
		[40.8783, -73.9228],
		[40.8757, -73.9162],
	],
	'25': [
		[40.5866, -73.8935],
		[40.5901, -73.9004],
	],
	'26': [
		[40.6006, -73.8229],
		[40.5949, -73.8219],
	],
	'27': [
		[40.7449, -73.9572],
		[40.7506, -73.9692],
	],
	'28': [
		[40.6904, -74.0139],
		[40.6732, -74.0236],
	],
	'29': [
		[40.8101, -73.7942],
		[40.7961, -73.8032],
	],
	'30': [
		[40.6069, -74.0454],
		[40.6096, -74.0835],
	],
};

const isoTimeNoMs = (t: Date) => t.toISOString().split(/\.\d{3}Z/)[0];

/** week by inclusive start, exclusive end (?)
 * e.g. [
 * 	Mar 07 12:00:00 AM - Mar 13 11:59:59 PM,
 * 	Mar 14 12:00:00 AM - Mar 20 11:59:59 PM,
 * 	Mar 21 12:00:00 AM - Mar 27 11:59:59 PM,
 * 	...
 * ]
 */
export const getWeekDataByDate = async (
	startDate: Date
): Promise<BridgeAndTunnelData[]> => {
	const endDate = new Date(startDate.getTime() + weekInMs);

	const urlStartdate = encodeURIComponent(isoTimeNoMs(startDate));
	const urlEndDate = encodeURIComponent(isoTimeNoMs(endDate));

	const baseSelectURL = getBridgeAndTunnelTrafficDataUrl(
		urlStartdate,
		urlEndDate
	);

	return fetch(baseSelectURL)
		.then((res) => res.json())
		.then((res: BridgeAndTunnelRes) =>
			res.map((d): BridgeAndTunnelData => {
				return {
					direction: d.direction,
					plaza_id: d.plaza_id,
					plaza_name: BATNameMap[d.plaza_id],
					median_vehicles:
						(Number(d.median_vehicles_e_zpass) +
							Number(d.median_vehicles_vtoll)) /
						2,
				};
			})
		)
		.then((v) => {
			console.log(v);
			return v;
		});
};
