import 'leaflet/dist/leaflet.css';
import './App.scss';
import DataContainer from './components/DataContainer';

function App() {
	return (
		<div id="app-container">
			<DataContainer />
			<div className="too-small">
				Your screen size is too small, please view on a larger screen to
				continue.
			</div>
		</div>
	);
}

export default App;
