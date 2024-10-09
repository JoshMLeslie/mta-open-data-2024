import {
	Button,
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
import { dispatchDateUpdate, onStopAnimation } from '../util/events';

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
	const [dateIndex, setDateIndex] = useState(0);

	onStopAnimation(() => stopAnimation());

	const updateAnimationIndex = (index: number): void => {
		setDateIndex(index);
		dispatchDateUpdate(DateList[index]);
	};

	const startInterval = (): void => {
		animationIntervalId.current = setInterval(() => {
			setDateIndex((index) => {
				if (index < DateList.length - 1) {
					const newIndex = index + 1;
					dispatchDateUpdate(DateList[newIndex]);
					return newIndex;
				} else {
					stopAnimation();
					return index;
				}
			});
		}, 1000);
	};

	const stopInterval = (): void => {
		clearInterval(animationIntervalId.current);
	};

	const startAnimation = () => {
		setAnimationRunning(true);
		startInterval();
	};

	const stopAnimation = () => {
		setAnimationRunning(false);
		stopInterval();
	};

	const toggleAnimation = (): void => {
		isAnimationRunning ? stopAnimation() : startAnimation();
	};

	const resetAnimation = (): void => {
		stopAnimation();
		setDateIndex(0);
		dispatchDateUpdate(DateList[0]);
	}

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
			<Button onClick={toggleAnimation} variant="outlined">
				{isAnimationRunning ? 'Freeze' : 'Animate'}
			</Button>
			<Button
				onClick={resetAnimation}
				variant="outlined"
				disabled={dateIndex === 0}
			>
				Reset
			</Button>
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

			<FormControl sx={{minWidth: 130}}>
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
