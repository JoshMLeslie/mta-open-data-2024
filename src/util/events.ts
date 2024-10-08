const eDATE_UPDATE = 'date-update';
/** Date is in format of MM/DD/YYYY */
export const dispatchDateUpdate = (date: string) => {
	const eUPDATE_DATE = new CustomEvent(eDATE_UPDATE, {detail: date});
	document.dispatchEvent(eUPDATE_DATE);
};
/** Date is in format of MM/DD/YYYY */
export const onDateUpdate = (callback: ({detail}: {detail: string}) => any) =>
	document.addEventListener<typeof eDATE_UPDATE>(eDATE_UPDATE, callback);

const eMODAL_MSG = 'modal-message';
export const dispatchModalMessage = (msg: string) => {
	const eUPDATE_DATE = new CustomEvent(eMODAL_MSG, {detail: msg});
	document.dispatchEvent(eUPDATE_DATE);
};
export const onModalMessage = (callback: ({detail}: {detail: string}) => any) =>
	document.addEventListener<typeof eMODAL_MSG>(eMODAL_MSG, callback);
