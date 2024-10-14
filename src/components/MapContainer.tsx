import { Stack } from '@mui/material';
import { LatLngBoundsLiteral, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { BAT_ID } from '../@types/mta-api';
import { getWeekDataByDate, NYCBridgeAndTunnelBounds } from '../api/mta-api';
import InitCovidHeatMap from './CovidHeatmap';

const INIT_ZOOM = 11;
const MAX_ZOOM = 13;
const nycCenter: LatLngExpression = [40.73061, -73.935242];

const CovidMapContent = ({ready}: {ready: boolean}) => {
	const map = useMap();
	useEffect(() => {
		if (ready) {
			InitCovidHeatMap(map);
		}
	}, [map, ready]);

	return (
		<TileLayer
			attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
	);
};
const MtaMapContent = ({ready}: {ready: boolean}) => {
	const map = useMap();
	useEffect(() => {
		if (ready) {
			Object.entries<BAT_ID, LatLngBoundsLiteral>(
				NYCBridgeAndTunnelBounds
			).forEach(([key, bound]) => {
				new L.Polygon(bound).addTo(map);
			});
		}
	}, [map, ready]);

	useEffect(() => {
		getWeekDataByDate(new Date('2020-03-07'));
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
				<CovidMapContent ready={covidMapReady} />
			</MapContainer>
			<MapContainer
				id="ridership-data-map"
				center={nycCenter}
				maxZoom={MAX_ZOOM}
				zoom={INIT_ZOOM}
				scrollWheelZoom={true}
				whenReady={() => setMtaMapReady(true)}
			>
				<MtaMapContent ready={mtaMapReady} />
			</MapContainer>
		</Stack>
	);
};
