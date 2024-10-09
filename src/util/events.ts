const eDATE_UPDATE = 'date-update';
/** Date is in format of MM/DD/YYYY */
export const dispatchDateUpdate = (date: string) => {
	document.dispatchEvent(new CustomEvent(eDATE_UPDATE, {detail: date}));
};
/** Date is in format of MM/DD/YYYY */
export const onDateUpdate = (callback: ({detail}: {detail: string}) => any) =>
	document.addEventListener(eDATE_UPDATE, callback);

const eMODAL_MSG = 'modal-message';
export const dispatchModalMessage = (msg: string) => {
	document.dispatchEvent(new CustomEvent(eMODAL_MSG, {detail: msg}));
};
export const onModalMessage = (callback: ({detail}: {detail: string}) => any) =>
	document.addEventListener(eMODAL_MSG, callback);

const eSTOP_ANIMATION = 'stop-animation';
export const dispatchStopAnimation = () => {
	document.dispatchEvent(new Event(eSTOP_ANIMATION));
};
export const onStopAnimation = (callback: () => any) =>
	document.addEventListener(eSTOP_ANIMATION, callback);
