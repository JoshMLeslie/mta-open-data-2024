import axios from 'axios';
import { LatLngBoundsLiteral } from 'leaflet';
import * as Parser from 'papaparse';

/** where data: {[MODZCTA: string]: ratePer100000} */
export type DateDatum = {[MODZCTA: string]: number};
export interface DateData {
	date: string;
	data: DateDatum;
}
export type DataByDate = DateData[];

export interface ModzctaGeometry {
	type: 'Polygon';
	coordinates: LatLngBoundsLiteral[];
}
export interface ModzctaProps {
	MODZCTA: string; // e.g. '10001';
	label: string; // e.g. '10001, 10118';
}

export interface CV19_GeoJSON {
	type: 'FeatureCollection';
	features: Array<{
		type: 'Feature';
		id: string;
		properties: ModzctaProps;
		geometry: ModzctaGeometry;
	}>;
}

export const getDateData = async (): Promise<DataByDate> => {
	try {
		const res = await axios.get(
			'https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/trends/caserate-by-modzcta.csv'
		);
		const [headers, ...data] = Parser.parse<string[]>(res.data.trim()).data; // gets an extra "data" from Parser
		const formatted = data.reduce<DataByDate>((acc, row) => {
			const [date, ...rates] = row;
			acc.push({
				date,
				data: rates.reduce<Record<string, number>>((acc, rate, i) => {
					const useIdx = i + 1; // offset for 'date' at 0;
					const key = headers[useIdx].split('CASERATE_')[1];
					acc[key] = +rate;
					return acc;
				}, {}),
			});
			return acc;
		}, []);
		return formatted;
	} catch (e) {
		console.error(e);
		return [];
	}
};

// base zip code to modzcta mapping
// const zctaToModzcta = "https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/Geography-resources/ZCTA-to-MODZCTA.csv"

export const getGeoData = async (): Promise<CV19_GeoJSON | null> => {
	const geojsonModzcta =
		'https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/Geography-resources/MODZCTA_2010_WGS1984.geo.json';
	try {
		return (await axios.get<CV19_GeoJSON>(geojsonModzcta)).data;
	} catch (e) {
		console.warn(e);
		return null;
	}
};
