import { ChartDataset } from 'chart.js';

export enum NYC_Borough {
	BRONX = 'Bronx',
	BROOKLYN = 'Brooklyn',
	MANHATTAN = 'Manhattan',
	QUEENS = 'Queens',
	STATEN_ISLAND = 'Staten Island',
}
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

export interface TurnstileDataFeb2022 {
	avg_ridership: string; // float string, per hour
	borough: NYC_Borough;
	by_month_transit_timestamp: string; // ISO
	station_complex: string; // formatted `Station Name (Line)`
}

export interface TurnstileDataUnit extends Omit<TurnstileData, 'station'> {
	unit: string; // fallback mapping if !station c.2022
}
export interface TurnstileData {
	avg_exits: string; // float string, per month
	by_month_date: string; // ISO
	line_name: string;
	station: string;
}
/**
 * station e.g. "103 ST"
 * station.date is an ISO string
 * line_name e.g.  '1', '6', 'BC', etc.
 */
export interface RouteData {
	[station: string]: {
		[date: string]: {
			[line_name: string]: number;
		};
	};
}

export type MtaChartDatum = (number | null)[];
export type MtaChartSeries = ChartDataset<'bar', MtaChartDatum>[];

export interface MagnitudeShift {
	id: string;
	stop: string;
	date: string;
	magAdjDiff: number;
	magAdjRidership: number;
	currentRidership: number;
	magnitude: number;
	prevRidership: number;
}
export type MagnitudeShiftTracking = MagnitudeShift[];

export interface BoroughChartDatum {
	chartData: MtaChartSeries;
	magShiftTracking: MagnitudeShiftTracking;
}
export type BoroughChartData = Record<string, BoroughChartDatum>;

export type UnitToStationRaw = {station: string; unit: string}[];
export type UnitToStation = {[unit: string]: string};
