import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Slider,
	SliderValueLabelProps,
	Stack,
	Tooltip,
} from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { createWeeklyDates } from '../util/date-generator';
import { dispatchDateUpdate } from '../util/events';

const DateList = createWeeklyDates('03/07/2020'); // hardcoded from NYC covid data

function ValueLabelComponent({children, value}: SliderValueLabelProps) {
	return (
		<Tooltip enterTouchDelay={0} placement="top" title={DateList[value]}>
			{children}
		</Tooltip>
	);
}

export const MapAnimator = () => {
	const [isAnimationRunning, setAnimationRunning] = useState(false);
	const animationIntervalId = useRef<NodeJS.Timer>();
	const [dateIndex, setAnimationIndex] = useState(0);

	const updateAnimationIndex = (index: number): void => {
		setAnimationIndex(index);
		dispatchDateUpdate(DateList[index]);
	};

	const startInterval = (): void => {
		animationIntervalId.current = setInterval(() => {
			setAnimationIndex((index) => {
				console.log(index);
				const newIndex = index + 1;
				dispatchDateUpdate(DateList[newIndex]);
				return newIndex;
			});
		}, 1000);
	};

	const stopInterval = (): void => {
		clearInterval(animationIntervalId.current);
	};

	const toggleAnimation = (): void => {
		if (isAnimationRunning) {
			setAnimationRunning(false);
			stopInterval();
		} else {
			setAnimationRunning(true);
			startInterval();
		}
	};

	const handleDateSlider = (_: Event, newValue: number | number[]): void => {
		const useValue = typeof newValue === 'number' ? newValue : 0;
		updateAnimationIndex(useValue);
	};

	const handleDateSelect = (
		newValue: SelectChangeEvent<string>,
		_: ReactNode
	): void => {
		const useValue = newValue.target.value;
		const index = DateList.findIndex((item) => item === useValue);
		updateAnimationIndex(index);
	};

	return (
		<Stack spacing={2} direction="row" sx={{padding: 1}} alignItems="center">
			<button type="button" onClick={toggleAnimation}>
				Start/Stop
			</button>
			<Slider
				value={dateIndex}
				onChange={handleDateSlider}
				valueLabelDisplay="auto"
				slots={{
					valueLabel: ValueLabelComponent,
				}}
				marks={true}
				max={DateList.length - 1}
			/>

			<FormControl sx={{width: 180}}>
				<InputLabel>Selected Date</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={DateList[dateIndex]}
					label="Selected Date"
					onChange={handleDateSelect}
				>
					{DateList.map((date) => (
						<MenuItem value={date} key={date}>
							{date}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Stack>
	);
};
