import { Slider, SliderValueLabelProps, Stack, Tooltip } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useRef, useState } from 'react';
import './App.css';
import { MapWrapper } from './components/MapContainer';
import { createWeeklyDates } from './util/date-generator';
import { dispatchDateUpdate } from './util/events';

const DateList = createWeeklyDates('03/07/2020'); // hardcoded from NYC covid data

function ValueLabelComponent({children, value}: SliderValueLabelProps) {
	return (
		<Tooltip enterTouchDelay={0} placement="top" title={DateList[value]}>
			{children}
		</Tooltip>
	);
}

const MapAnimator = () => {
	const [isAnimationRunning, setAnimationRunning] = useState(false);
	const animationIntervalId = useRef<NodeJS.Timer>();
	const [dateIndexAnimation, setAnimationIndex] = useState(0);

	const startInterval = () => {
		animationIntervalId.current = setInterval(() => {
			setAnimationIndex((index) => {
				console.log(index);
				const newIndex = index + 1;
				dispatchDateUpdate(DateList[newIndex]);
				return newIndex;
			});
		}, 1000);
	};

	const stopInterval = () => {
		clearInterval(animationIntervalId.current);
	};

	const toggleAnimation = () => {
		if (isAnimationRunning) {
			setAnimationRunning(false);
			stopInterval();
		} else {
			setAnimationRunning(true);
			startInterval();
		}
	};

	const handleDateSlider = (_: Event, newValue: number | number[]) => {
		const useValue = typeof newValue === 'number' ? newValue : 0;
		setAnimationIndex(useValue);
		dispatchDateUpdate(DateList[useValue]);
	};

	return (
		<Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
			<button type="button" onClick={toggleAnimation}>
				Start/Stop
			</button>
			<Slider
				value={dateIndexAnimation}
				onChange={handleDateSlider}
        valueLabelDisplay='auto'
				slots={{
					valueLabel: ValueLabelComponent,
				}}
				marks={true}
				max={DateList.length}
			/>
			<span style={{fontSize: '24px'}}>{DateList[dateIndexAnimation]}</span>
		</Stack>
	);
};

function App() {
	return (
		<div id="app-container">
			<MapWrapper />
			<MapAnimator />
		</div>
	);
}

export default App;
