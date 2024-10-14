// adapted from https://handsondataviz.org/leaflet-heatmap.html

import L from 'leaflet';
import { HeatMapData } from '../@types/leaflet-plugins';
import {
	CV19_GeoJSON,
	DataByDate,
	DateData,
	getDateData,
	getGeoData,
} from '../api/covid-data';
import '../plugins/heatmap';
import { HeatLayerInstance } from '../plugins/heatmap';
import heatlayer from '../plugins/raw-heatmap';
import { dispatchStopAnimation, onDateUpdate } from '../util/events';

const dataToHeatMap = (
	covidData: DateData,
	geojsonData: CV19_GeoJSON
): {centersWithHeat: HeatMapData; weeklyMax: number} => {
	const {data: selectedCovidData} = covidData;

	const weeklyMax = Object.values(selectedCovidData).reduce((max, current) => {
		return Math.max(max, current);
	}, 0);

	const centersWithHeat = geojsonData.features.map((feature) => {
		const center = L.polygon(feature.geometry.coordinates)
			.getBounds()
			.getCenter();
		const {MODZCTA} = feature.properties;
		const heat = selectedCovidData[MODZCTA] / weeklyMax || 0;
		// flip because NYC uses lng,lat vs lat,lng
		return [center.lng, center.lat, heat];
	});

	return {centersWithHeat, weeklyMax};
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
			const self = this as any as L.Control.TextBox;
			const text = L.DomUtil.create('div');
			text.id = self.options.id || '';
			text.className = self.options.className + ' heatmap-textbox';
			text.innerHTML = initText;
			return text;
		},
		updateText: function (text: string) {
			const self = this as any as L.Control.TextBox;
			const container = self.getContainer();
			if (!container) return;
			container.innerText = text;
		},
	});
	const textbox = new L.Control.TextBox({
		position: 'bottomleft',
		id: 'covid-case-text',
	});
	if (map) {
		textbox.addTo(map);
	}
	return textbox;
};

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
			const pauseOnNoData = false;
			if (pauseOnNoData) {
				// todo
				dispatchStopAnimation();
			}
			textbox.updateText('NO DATA');
			heatMapLayer?.setLatLngs([]);
			return;
		}

		const {centersWithHeat, weeklyMax} = dataToHeatMap(useDateData, geoData);
		textbox.updateText(
			'Max cases this week, per 100,000: ' + weeklyMax.toString()
		);
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

const InitCovidHeatMap = async (map: L.Map): Promise<void> => {
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
export default InitCovidHeatMap;
