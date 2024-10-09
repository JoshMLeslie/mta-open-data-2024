import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import InitHeatMap from './Heatmap';

const INIT_ZOOM = 11;
const MAX_ZOOM = 13;
const nycCenter: LatLngExpression = [40.73061, -73.935242];

const MapContent = ({ready}: {ready: boolean}) => {
	const map = useMap();
	useEffect(() => {
		if (ready) {
			InitHeatMap(map);
		}
	}, [map, ready]);

	return (
		<TileLayer
			attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
	);
};

export const MapWrapper = () => {
	const [ready, setReady] = useState(false);
	return (
		<MapContainer
			center={nycCenter}
			maxZoom={MAX_ZOOM}
			zoom={INIT_ZOOM}
			scrollWheelZoom={true}
			whenReady={() => setReady(true)}
		>
			<MapContent ready={ready} />
		</MapContainer>
	);
};
