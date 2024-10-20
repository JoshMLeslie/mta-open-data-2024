/**
 * NB event labels must be added to the file dom.d.ts for proper type handling.
 */

/**
 * Type for event listeners that can be unsubscribed from using returned function
 */
type OnUpdateEvent<CB extends Function> = (callback: CB) => () => void;

const eDATE_UPDATE = 'date-update';
/** Date is in format of MM/DD/YYYY */
export const dispatchDateUpdate = (date: string) => {
	document.dispatchEvent(new CustomEvent(eDATE_UPDATE, {detail: date}));
};
/** Date is in format of MM/DD/YYYY */
export const onDateUpdate: OnUpdateEvent<
	({detail}: {detail: string}) => any
> = (callback) => {
	document.addEventListener(eDATE_UPDATE, callback);
	return () => document.removeEventListener(eDATE_UPDATE, callback);
};

export const eMODAL_MSG = 'modal-message';
export const dispatchModalMessage = (msg: string) => {
	document.dispatchEvent(new CustomEvent(eMODAL_MSG, {detail: msg}));
};
export const onModalMessage: OnUpdateEvent<
	({detail}: {detail?: string}) => any
> = (callback) => {
	document.addEventListener(eMODAL_MSG, callback);
	return () => document.removeEventListener(eMODAL_MSG, callback);
};

export const eSTOP_ANIMATION = 'stop-animation';
export const dispatchStopAnimation = () => {
	document.dispatchEvent(new Event(eSTOP_ANIMATION));
};
export const onStopAnimation: OnUpdateEvent<() => any> = (callback) => {
	document.addEventListener(eSTOP_ANIMATION, callback);
	return () => document.removeEventListener(eSTOP_ANIMATION, callback);
};

// TODO clicking on a borough on the map triggers chart update??
// export const eBOROUGH_SELECT = 'borough-select';
// export const dispatchBoroughSelect = (borough: string) => {
// 	document.dispatchEvent(new CustomEvent(eBOROUGH_SELECT, {detail: borough}));
// };
// export const onBoroughSelect: OnUpdateEvent<
// 	({detail}: {detail: string}) => any
// > = (callback) => {
// 	document.addEventListener(eBOROUGH_SELECT, callback);
// 	return () => document.removeEventListener(eBOROUGH_SELECT, callback);
// };
