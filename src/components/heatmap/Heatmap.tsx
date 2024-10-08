// adapted from https://handsondataviz.org/leaflet-heatmap.html

import axios from 'axios';
import L, { LatLngBoundsLiteral } from 'leaflet';
import Parser from 'papaparse';
import { HeatLayerData } from '../../@types/leaflet-plugins';
import '../../plugins/heatmap';
import heatLayer from '../../plugins/heatmap';
import { dispatchModalMessage, onDateUpdate } from '../../util/events';

// where data: {location: ratePer100000}
type DateDatum = {[location: string]: number};
interface DateData {
	date: string;
	data: DateDatum;
}
type DataByDate = DateData[];

interface ModzctaGeometry {
	type: 'Polygon';
	coordinates: LatLngBoundsLiteral[];
}
interface ModzctaProps {
	MODZCTA: string; // e.g. '10001';
	label: string; // e.g. '10001, 10118';
}

interface CV19_GeoJSON {
	type: 'FeatureCollection';
	features: Array<{
		type: 'Feature';
		id: string;
		properties: ModzctaProps;
		geometry: ModzctaGeometry;
	}>;
}

const getDateData = async (): Promise<DataByDate> => {
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

const getGeoData = async (): Promise<CV19_GeoJSON | null> => {
	const geojsonModzcta =
		'https://raw.githubusercontent.com/nychealth/coronavirus-data/refs/heads/master/Geography-resources/MODZCTA_2010_WGS1984.geo.json';
	try {
		return (await axios.get<CV19_GeoJSON>(geojsonModzcta)).data;
	} catch (e) {
		console.warn(e);
		return null;
	}
};

const dataToHeatMap = (
	covidData: DateData,
	geojsonData: CV19_GeoJSON
): HeatLayerData => {
	const {data: selectedCovidData} = covidData;

	const localMax = Object.values(selectedCovidData).reduce((max, current) => {
		return Math.max(max, current);
	}, 0);

	const centersWithHeat = geojsonData.features.map((feature) => {
		const center = L.polygon(feature.geometry.coordinates)
			.getBounds()
			.getCenter();
		const {MODZCTA} = feature.properties;
		const heat = selectedCovidData[MODZCTA] / localMax || 0;
		// flip because NYC uses lng,lat vs lat,lng
		return [center.lng, center.lat, heat];
	});

	return centersWithHeat;
};

const InitHeatMap = async (map: L.Map): Promise<void> => {
	let heatMapLayer: L.Layer | null = null;
	try {
		const [dateData, geoData] = await Promise.all([
			getDateData(),
			getGeoData(),
		]);
		if (!dateData || !geoData) return;

		onDateUpdate(({detail: targetDate}) => {
			if (heatMapLayer !== null) {
				(heatMapLayer as L.Layer).removeFrom(map);
			}
			
			const useDateData = dateData.find((d) => d.date === targetDate);
			console.log(useDateData)
			if (!useDateData) {
				dispatchModalMessage("No data for selected date.");
				return;
			}

			const heatData = dataToHeatMap(useDateData, geoData);
			heatMapLayer = heatLayer(heatData, {
				radius: 50,
				maxZoom: 13,
			});
			heatMapLayer!.addTo(map);
		});
	} catch (e) {
		console.warn(e);
	}
};
export default InitHeatMap;
