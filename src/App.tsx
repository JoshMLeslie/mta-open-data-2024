import 'leaflet/dist/leaflet.css';
import './App.css';
import { AttachedModal } from './components/AttachedModal';
import { MapAnimator } from './components/MapAnimator';
import { MapWrapper } from './components/MapContainer';

function App() {
	return (
		<div id="app-container">
			<MapWrapper />
			<MapAnimator />
			<AttachedModal />
		</div>
	);
}

export default App;
