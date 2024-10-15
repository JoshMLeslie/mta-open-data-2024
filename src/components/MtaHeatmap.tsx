// adapted from https://handsondataviz.org/leaflet-heatmap.html

import L from 'leaflet';
import { HeatMapData } from '../@types/leaflet-plugins';
import { get2022Data } from '../api/mta-api';
import '../plugins/heatmap';
import { HeatLayerInstance } from '../plugins/heatmap';
import heatlayer from '../plugins/raw-heatmap';
import { onDateUpdate } from '../util/events';

// based on the 2022 Data
interface MTA_DATUM {
	avg_ridership: string; // float string
	georeference: {type: 'Point'; coordinates: number[]};
	station_complex: string;
	station_complex_id: string; // numeric string
}

type MTA_DATA = MTA_DATUM[];

const dataToHeatMap = (
	data: MTA_DATA
): {centersWithHeat: HeatMapData; weeklyMax: number} => {
	const weeklyMax = data.reduce((max, {avg_ridership}) => {
		return Math.max(max, Number(avg_ridership));
	}, 0);

	const centersWithHeat = data.map((d) => {
		const heat = Number(d.avg_ridership) / weeklyMax || 0;
		// flip because NYC uses lng,lat vs lat,lng
		const [lng, lat] = d.georeference.coordinates;
		return [lat, lng, heat];
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

const setupHeatLayer = (map: L.Map) => {
	let heatMapLayer: HeatLayerInstance | null = null;
	const textbox = createDateTextBox('', map);
	return (data: MTA_DATA) => {
		const {centersWithHeat, weeklyMax} = dataToHeatMap(data);
		textbox.updateText(
			'Max ridership this week, per day: ' + weeklyMax.toString()
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

const InitMtaHeatMap = (map: L.Map, data: MTA_DATA): void => {
	try {
		const updateHeatLayer = setupHeatLayer(map);
		// init first paint
		updateHeatLayer(data);
		// listen for updates
		onDateUpdate(({detail: targetDate}) => {
			get2022Data(new Date(targetDate)).then((r) => {
				updateHeatLayer(r);
			});
		});
	} catch (e) {
		console.warn(e);
	}
};
export default InitMtaHeatMap;
