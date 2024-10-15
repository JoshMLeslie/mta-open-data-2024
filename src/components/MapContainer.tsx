import { Stack } from '@mui/material';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { get2022Data } from '../api/mta-api';
import boroughBoundaries from '../geojson/borough-boundaries.json';
import InitCovidHeatMap from './CovidHeatmap';
import InitMtaHeatMap from './MtaHeatmap';

const INIT_ZOOM = 11;
const MAX_ZOOM = 15;
const nycCenter: LatLngExpression = [40.73061, -73.935242];

type SetMap = (key: string, map: L.Map) => void;
interface SiblingMaps {
	covid?: L.Map;
	mta?: L.Map;
}
interface MapContentProps {
	ready: boolean;
	setMap: SetMap;
	siblingMaps: SiblingMaps;
}

const addBoroughs = (map: L.Map): void => {
	new L.GeoJSON(boroughBoundaries as any).addTo(map);
};

const CovidMapContent: React.FC<MapContentProps> = ({
	ready,
	setMap,
	siblingMaps,
}) => {
	const map = useMapEvents({
		drag: () => {
			siblingMaps.mta?.setView(map.getCenter());
		},
		zoom: () => {
			siblingMaps.mta?.setView(map.getCenter(), map.getZoom());
		},
	});
	useEffect(() => {
		if (ready) {
			setMap('covid', map);
			InitCovidHeatMap(map);
			addBoroughs(map);
		}
	}, [map, ready]);

	return (
		<TileLayer
			attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
	);
};
const MtaMapContent: React.FC<MapContentProps> = ({
	ready,
	setMap,
	siblingMaps,
}) => {
	const map = useMapEvents({
		drag: () => {
			siblingMaps.covid?.setView(map.getCenter());
		},
		zoom: () => {
			siblingMaps.covid?.setView(map.getCenter(), map.getZoom());
		},
		click: (e) => {
			console.log(e.latlng);
		},
	});
	useEffect(() => {
		if (ready) {
			setMap('mta', map);
			(async function () {
				InitMtaHeatMap(map, await get2022Data(new Date('2022-03-01')));
			})();
		}
	}, [map, ready]);

	useEffect(() => {
		// 	getWeekDataByDate(new Date('2020-03-07'));
	}, []);

	return (
		<TileLayer
			attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
	);
};

export const MapWrapper = () => {
	const [covidMapReady, setCovidMapReady] = useState(false);
	const [mtaMapReady, setMtaMapReady] = useState(false);
	const [maps, setMaps] = useState<SiblingMaps>({});

	const setMap = (key: string, map: L.Map) => {
		setMaps((prev) => ({
			...prev,
			[key]: map,
		}));
	};

	return (
		<Stack direction="row" id="map-wrapper">
			<MapContainer
				id="covid-data-map"
				center={nycCenter}
				maxZoom={MAX_ZOOM}
				zoom={INIT_ZOOM}
				scrollWheelZoom={true}
				whenReady={() => setCovidMapReady(true)}
			>
				<CovidMapContent
					ready={covidMapReady}
					setMap={setMap}
					siblingMaps={maps}
				/>
			</MapContainer>
			<div id="map-sibling-vertical-divider"></div>
			<MapContainer
				id="ridership-data-map"
				center={nycCenter}
				maxZoom={MAX_ZOOM}
				zoom={INIT_ZOOM}
				scrollWheelZoom={true}
				whenReady={() => setMtaMapReady(true)}
			>
				<MtaMapContent ready={mtaMapReady} setMap={setMap} siblingMaps={maps} />
			</MapContainer>
		</Stack>
	);
};
