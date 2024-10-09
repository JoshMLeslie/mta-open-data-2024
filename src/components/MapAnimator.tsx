import {
	Button,
	ButtonGroup,
	FormControl,
	InputLabel,
	InputProps,
	MenuItem,
	Select,
	SelectChangeEvent,
	Slider,
	SliderValueLabelProps,
	Stack,
	TextField,
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
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
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

	const handleSetPlaybackSpeed: InputProps['onChange'] = (e) => {
		if (!isNaN(Number(e.target.value))) {
			setPlaybackSpeed(Number(e.target.value));
		}
	};
	const decreasePlaybackSpeed = () => {
		setPlaybackSpeed((pbs) => {
			if (pbs > 1) {
				return pbs - 1;
			} else {
				return pbs - 0.125;
			}
		});
	};
	const increasePlaybackSpeed = () => {
		setPlaybackSpeed((pbs) => pbs + 1);
	};

	return (
		<Stack>
			<Stack
				spacing={2}
				direction="row"
				justifyContent="center"
				alignItems="center"
				padding={1}
			>
				<ButtonGroup>
					<Button onClick={decreasePlaybackSpeed} variant="outlined">
						-
					</Button>
					<TextField
						label="Seconds per frame"
						value={playbackSpeed}
						onChange={handleSetPlaybackSpeed}
						variant="outlined"
						sx={{width: '140px'}}
					/>
					<Button onClick={increasePlaybackSpeed} variant="outlined">
						+
					</Button>
				</ButtonGroup>
				<Button
					onClick={toggleAnimation}
					variant="outlined"
					sx={{height: '100%', minWidth: 'fit-content'}}
				>
					{isAnimationRunning ? 'Freeze' : 'Animate'}
				</Button>
				<Button
					onClick={resetAnimation}
					variant="outlined"
					disabled={dateIndex === 0}
					sx={{height: '100%', minWidth: 'fit-content'}}
				>
					Reset
				</Button>
			</Stack>
			<Stack
				direction="row"
				spacing={2}
				justifyContent="center"
				alignItems="center"
				padding={1}
			>
				<Slider
					sx={{display: {xs: 'none', sm: 'inline-block'}}}
					value={dateIndex}
					onChange={handleDateSlider}
					valueLabelDisplay="auto"
					slots={{
						valueLabel: ValueLabelComponent,
					}}
					marks={true}
					max={DateList.length - 1}
				/>

				<FormControl sx={{minWidth: '140px'}}>
					<InputLabel>Selected Date</InputLabel>
					<Select
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
		</Stack>
	);
};
