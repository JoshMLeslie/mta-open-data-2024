/** @param {string} initialDateString - MM/DD/YYYY */
const dayInMS = 86400000;
const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${month}/${day}/${year}`;
};

export const createWeeklyDates = (initialDateString: string) => {
	const today = new Date();
	const result = [];
	const initialDate = new Date(initialDateString);
	let currentDate = initialDate;

	while (currentDate <= today) {
		const formattedDate = formatDate(currentDate);
		result.push(formattedDate);
		currentDate.setTime(currentDate.getTime() + dayInMS * 7);
	}

	return result;
};
