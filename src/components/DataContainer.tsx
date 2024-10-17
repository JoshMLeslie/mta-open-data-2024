import { Stack } from '@mui/material';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import boroughBoundaries from '../geojson/borough-boundaries.json';
import InitCovidHeatMap from './CovidHeatmap';
import InfoContainer from './InfoContainer';
import { MTAChart } from './MTAChart';

const INIT_ZOOM = 10;
const MAX_ZOOM = 15;
const nycCenter: LatLngExpression = [40.73061, -73.935242];

interface MapContentProps {
	ready: boolean;
}

const addBoroughs = (map: L.Map): void => {
	new L.GeoJSON(boroughBoundaries as any).addTo(map);
};

const CovidMapContent: React.FC<MapContentProps> = ({ready}) => {
	const map = useMap();
	useEffect(() => {
		if (ready) {
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

const DataContainer = () => {
	const [covidMapReady, setCovidMapReady] = useState(false);

	return (
		<div id="data-container">
			<Stack direction="row" gap={2}>
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
				<InfoContainer />
			</Stack>
			<MTAChart />
		</div>
	);
};

export default DataContainer;
