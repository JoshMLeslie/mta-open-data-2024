import { useEffect, useState } from 'react';
import { onLoadingUpdate } from '../util/events';

// it's brittle like this, but it's a quicker
const SegmentLoaderBar: React.FC = () => {
	const [childrenEls, setChildren] = useState<any[] | null>([]);

	const createChildren = (segments: number) => {
		const childEls = [];
		for (let offset = 0; offset < segments - 1; offset++) {
			const childEl = (
				<div
					key={offset}
					id={`${offset}-segment-loader-child`}
					className="segment-loader-child"
				>
					<div></div>
				</div>
			);
			childEls.push(childEl);
		}
		setChildren(childEls);
	};

	useEffect(() => {
		const teardownLoadUpdate = onLoadingUpdate(({detail}) => {
			if (typeof detail === 'string') {
				return;
			}
			const {eventLabel, value} = detail;
			if (eventLabel === 'mta-api-segment-count') {
				setChildren([]);
				if (value > 0) {
					createChildren(value);
				}
			} else if (eventLabel === 'mta-api-segment-loaded') {
				const loaderChild = document.getElementById(
					value / 100 + '-segment-loader-child'
				);
				if (loaderChild) {
					loaderChild.classList.add('loaded');
				}
			}
		});
		return () => {
			teardownLoadUpdate();
		};
	}, []);

	return <div className="segment-loader-bar-container">{childrenEls}</div>;
};
export default SegmentLoaderBar;
