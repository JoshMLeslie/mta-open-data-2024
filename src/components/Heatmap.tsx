// adapted from https://handsondataviz.org/leaflet-heatmap.html

import axios from 'axios';
import L, { LatLngBoundsLiteral } from 'leaflet';
import Parser from 'papaparse';
import { HeatMapData } from '../@types/leaflet-plugins';
import '../plugins/heatmap';
import { HeatLayerInstance } from '../plugins/heatmap';
import heatlayer from '../plugins/raw-heatmap';
import {
	dispatchModalMessage,
	dispatchStopAnimation,
	onDateUpdate,
} from '../util/events';

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
): {centersWithHeat: HeatMapData; localMax: number} => {
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

	return {centersWithHeat, localMax};
};

/**
 * @param map - adds to map, if provided
 */
const createDateTextBox = (
	initText: string,
	map?: L.Map
): L.Control.TextBox => {
	L.Control.TextBox = L.Control.extend<{
		onAdd: () => void;
		updateText: (text: string) => void;
	}>({
		onAdd: function () {
			var text = L.DomUtil.create('div');
			text.id = 'date-text';
			text.innerHTML = initText;
			return text;
		},
		updateText: function (text: string) {
			const container = (this as any as L.Control).getContainer();
			if (!container) return;
			container.innerText = text;
		},
	});
	const textbox = new L.Control.TextBox({position: 'bottomleft'});
	if (map) {
		textbox.addTo(map);
	}
	return textbox;
};

/**
 * @param targetDate - format "DD/MM/YYYY"
 */

type HeatLayerRender = (
	map: L.Map,
	targetDate: string,
	heatMapLayer: HeatLayerInstance | null,
	dateData: DataByDate,
	geoData: CV19_GeoJSON,
	textbox: L.Control.TextBox
) => any;

const setupHeatLayer = (
	map: L.Map,
	dateData: DataByDate,
	geoData: CV19_GeoJSON
) => {
	let heatMapLayer: HeatLayerInstance | null = null;
	const textbox = createDateTextBox('', map);
	const initDate = dateData[0].date;
	return (targetDate?: string) => {
		const useDateData = dateData.find(
			(d) => d.date === (targetDate || initDate)
		);
		if (!useDateData) {
			dispatchStopAnimation();
			dispatchModalMessage('No data for selected date.');
			return;
		}

		const {centersWithHeat, localMax} = dataToHeatMap(useDateData, geoData);
		textbox.updateText('Max cases this week, per 100,000: ' + localMax);
		if (heatMapLayer) {
			heatMapLayer.setLatLngs(centersWithHeat);
		} else {
			const layer = heatlayer(centersWithHeat, {
				radius: 50,
				maxZoom: 13,
			});
			layer.addTo(map);
			heatMapLayer = layer;
		}
	};
};

const InitHeatMap = async (map: L.Map): Promise<void> => {
	try {
		const [dateData, geoData] = await Promise.all([
			getDateData(),
			getGeoData(),
		]);
		if (!dateData?.length || !geoData) return;
		const updateHeatLayer = setupHeatLayer(map, dateData, geoData);
		// init first paint
		updateHeatLayer();
		// listen for updates
		onDateUpdate(({detail: targetDate}) => {
			updateHeatLayer(targetDate);
		});
	} catch (e) {
		console.warn(e);
	}
};
export default InitHeatMap;
