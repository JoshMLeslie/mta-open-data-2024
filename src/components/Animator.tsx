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
import { ReactNode, useEffect, useRef, useState } from 'react';
import { createWeeklyDates } from '../util/date-generator';
import {
	dispatchDateUpdate,
	dispatchModalMessage,
	onStopAnimation,
} from '../util/events';

type UpdateAnimationIndex =
	| {
			index: number;
			updateFn?: never;
	  }
	| {
			index?: never;
			updateFn: (index: number) => number;
	  };

const DateList = createWeeklyDates('03/07/2020'); // hardcoded from NYC covid data start date

function ValueLabelComponent({children, value}: SliderValueLabelProps) {
	return (
		<Tooltip enterTouchDelay={0} placement="top" title={DateList[value]}>
			{children}
		</Tooltip>
	);
}

export const Animator = () => {
	const [playbackSpeedText, setPlaybackSpeedText] = useState('1');
	const [isAnimationRunning, setAnimationRunning] = useState(false);
	const [dateIndex, setDateIndex] = useState(0);
	const lastPbs = useRef(playbackSpeedText);
	const animationIdRef = useRef<number | null>(null);
	const lastAnimationRef = useRef(0);

	onStopAnimation(() => stopAnimation());

	const requestFrame = () => {
		animationIdRef.current = requestAnimationFrame((time) => animate(time));
	};

	// cycle animation as playback speed changes
	useEffect(() => {
		if (
			isAnimationRunning &&
			lastPbs.current !== playbackSpeedText &&
			animationIdRef.current
		) {
			lastPbs.current = playbackSpeedText;
			cancelAnimationFrame(animationIdRef.current);
			requestFrame();
		}
	}, [playbackSpeedText]); // eslint-disable-line react-hooks/exhaustive-deps

	const animate = (timestamp: number): void => {
		if (isNaN(Number(playbackSpeedText))) {
			stopAnimation();
			dispatchModalMessage('Playbackspeed must be a valid number');
			return;
		}
		const elapsedTime = timestamp - lastAnimationRef.current;
		const timeThreshold = Math.pow(Number(playbackSpeedText), -1) * 1000;

		if (elapsedTime < timeThreshold) {
			requestFrame();
			return;
		}

		lastAnimationRef.current = timestamp;
		setDateIndex((idx) => {
			if (idx < DateList.length - 1) {
				requestFrame(); // always request a new frame since we're not done animating yet
				const newIndex = idx + 1;
				dispatchDateUpdate(DateList[newIndex]);
				return newIndex;
			} else {
				console.log('out of range, stopping');
				stopAnimation();
				return idx;
			}
		});
	};

	const updateAnimationIndex = ({
		index,
		updateFn,
	}: UpdateAnimationIndex): void => {
		if (index) {
			setDateIndex(index);
			dispatchDateUpdate(DateList[index]);
		} else if (updateFn) {
			setDateIndex((index) => {
				const newIndex = updateFn(index);
				dispatchDateUpdate(DateList[newIndex]);
				return newIndex;
			});
		}
	};

	const startAnimation = (): void => {
		if (Number(playbackSpeedText) <= 0) {
			alert('Playback speed must be greater than 0');
			return;
		}
		if (!isAnimationRunning) {
			lastAnimationRef.current = performance.now();
			setAnimationRunning(true);
			requestFrame();
		}
	};
	const stopAnimation = (): void => {
		if (isAnimationRunning || animationIdRef.current) {
			setAnimationRunning(false);
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current);
			}
			animationIdRef.current = null;
		}
	};

	const toggleAnimation = (): void => {
		isAnimationRunning ? stopAnimation() : startAnimation();
	};

	const resetAnimation = (): void => {
		stopAnimation();
		setDateIndex(0);
		setPlaybackSpeedText('1');
		dispatchDateUpdate(DateList[0]);
	};

	const handleDateSlider = (_: Event, newValue: number | number[]): void => {
		const index = typeof newValue === 'number' ? newValue : 0;
		updateAnimationIndex({index});
	};

	const handleDateSelect = (
		newValue: SelectChangeEvent<string>,
		_: ReactNode
	): void => {
		const useValue = newValue.target.value;
		const index = DateList.findIndex((item) => item === useValue);
		updateAnimationIndex({index});
	};

	const handleSetPlaybackSpeed: InputProps['onChange'] = (e) => {
		setPlaybackSpeedText(e.target.value);
	};

	// Adjust playback speed. PBS >= 1, adjust by 1. PBS < 1, adjust by 0.125.
	// Prevents non-positive values.
	const decreasePlaybackSpeed = () => {
		setPlaybackSpeedText((pbs) => {
			const useVal = Number(pbs);
			if (isNaN(useVal)) {
				return '1';
			}
			if (useVal === 0.125) {
				return pbs;
			}
			return `${useVal - (useVal > 1 ? 1 : 0.125)}`;
		});
	};
	const increasePlaybackSpeed = () => {
		setPlaybackSpeedText((pbs) => {
			const useVal = Number(pbs);
			if (isNaN(useVal)) {
				return '1';
			}
			return `${useVal + (useVal >= 1 ? 1 : 0.125)}`;
		});
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
						label="FPS"
						value={playbackSpeedText}
						onChange={handleSetPlaybackSpeed}
						variant="outlined"
						sx={{width: '80px'}}
					/>
					<Button onClick={increasePlaybackSpeed} variant="outlined">
						+
					</Button>
				</ButtonGroup>
				<ButtonGroup>
					<Button
						onClick={() => updateAnimationIndex({updateFn: (idx) => idx - 1})}
					>
						Prev Date
					</Button>
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
					<Button
						onClick={() => updateAnimationIndex({updateFn: (idx) => idx + 1})}
					>
						Next Date
					</Button>
				</ButtonGroup>

				<ButtonGroup sx={{height: "100%"}}>
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
				</ButtonGroup>
			</Stack>
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
		</Stack>
	);
};
