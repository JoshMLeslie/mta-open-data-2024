
// ripped from the MTA data
export type BAT_ID =
	| '21'
	| '22'
	| '23'
	| '24'
	| '25'
	| '26'
	| '27'
	| '28'
	| '29'
	| '30';
export interface BridgeAndTunnelDatum {
	direction: string;
	median_vehicles_e_zpass: string;
	median_vehicles_vtoll: string;
	plaza_id: BAT_ID;
}
export type BridgeAndTunnelRes = BridgeAndTunnelDatum[];
export interface BridgeAndTunnelData {
	direction: string;
	plaza_id: string;
	plaza_name: string;
	median_vehicles: number;
}