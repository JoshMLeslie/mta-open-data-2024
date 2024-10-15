// adapted from https://handsondataviz.org/leaflet-heatmap.html

import L, { LatLngLiteral } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
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

interface WeeklyCaseZipMax {
	value: number;
	zipcodes: Record<string, LatLngLiteral>;
}

const getWeeklyCaseZipMax = (selectedCovidData: DateData['data']) =>
	Object.entries<string, number>(selectedCovidData).reduce<WeeklyCaseZipMax>(
		(maximums, [zip, zipCaseCount]) => {
			if (!/\d{5}/.test(zip)) {
				// data additionally contains city and borough values
				return maximums;
			}

			const newMaxCount = Math.max(maximums.value, zipCaseCount);
			if (newMaxCount === 0) {
				return maximums;
			}
			if (newMaxCount !== maximums.value) {
				// if max has changed, reset obj to new max
				maximums = {
					value: newMaxCount,
					zipcodes: {},
				};
			}
			if (newMaxCount === zipCaseCount) {
				maximums.zipcodes[zip] = {lat: 0, lng: 0};
			}
			return maximums;
		},
		{value: 0, zipcodes: {}}
	);

const dataToHeatMap = (
	covidData: DateData,
	geojsonData: CV19_GeoJSON
): {
	centersWithHeat: HeatMapData;
	weeklyCaseZipMax: WeeklyCaseZipMax;
} => {
	const {data: selectedCovidData} = covidData;

	const weeklyCaseZipMax = getWeeklyCaseZipMax(selectedCovidData);

	const centersWithHeat = geojsonData.features.map((feature) => {
		const {MODZCTA} = feature.properties;
		const {lng, lat} = L.polygon(feature.geometry.coordinates)
			.getBounds()
			.getCenter();

		if (weeklyCaseZipMax.zipcodes[MODZCTA]) {
			weeklyCaseZipMax.zipcodes[MODZCTA] = {
				lat,
				lng,
			};
		}

		const heat = selectedCovidData[MODZCTA] / weeklyCaseZipMax.value || 0;

		// flip because NYC uses lng,lat vs lat,lng
		return [lng, lat, heat];
	});

	return {centersWithHeat, weeklyCaseZipMax};
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
	let weeklyMaxLocLayer: L.LayerGroup | null = null;

	const textbox = createDateTextBox('', map);
	const initDate = dateData[0].date;
	return (targetDate?: string) => {
		const useDateData = dateData.find(
			(d) => d.date === (targetDate || initDate)
		);
		if (!useDateData) {
			const pauseOnNoData = false;
			if (pauseOnNoData) {
				// todo?
				dispatchStopAnimation();
			}
			textbox.updateText('NO DATA');
			heatMapLayer?.setLatLngs([]);
			return;
		}

		if (weeklyMaxLocLayer) {
			weeklyMaxLocLayer.removeFrom(map);
			weeklyMaxLocLayer = null;
		}

		const {centersWithHeat, weeklyCaseZipMax} = dataToHeatMap(
			useDateData,
			geoData
		);

		if (weeklyCaseZipMax.value) {
			const markers = Object.entries(weeklyCaseZipMax.zipcodes).map(
				([zipcode, zipData]) => {
					const {lat, lng} = zipData;
					// flip lat, lng from NYC data
					return L.marker([lng, lat], {
						icon: L.icon({
							iconUrl: markerIconPng,
						}),
						title: 'Max case zipcode:' + zipcode,
						zIndexOffset: 1000,
					});
				}
			);

			weeklyMaxLocLayer = L.layerGroup(markers).addTo(map);
		}

		textbox.updateText(
			'Max cases this week, per 100,000: ' + weeklyCaseZipMax.value.toString()
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
