export interface BASE_SELECT {
	date: string;
	subways_total_estimated_ridership: string;
	subways_of_comparable_pre_pandemic_day: string;
	buses_total_estimated_ridersip: string;
	buses_of_comparable_pre_pandemic_day: string;
	lirr_total_estimated_ridership: string;
	lirr_of_comparable_pre_pandemic_day: string;
	metro_north_total_estimated_ridership: string;
	metro_north_of_comparable_pre_pandemic_day: string;
	access_a_ride_total_scheduled_trips: string;
	access_a_ride_of_comparable_pre_pandemic_day: string;
	bridges_and_tunnels_total_traffic: string;
	bridges_and_tunnels_of_comparable_pre_pandemic_day: string;
	staten_island_railway_total_estimated_ridership: string;
	staten_island_railway_of_comparable_pre_pandemic_day: string;
}

export type BASE_SELECT_DATA = BASE_SELECT[];

export interface ColumnForViewWithQuery {
	id: number;
	name: string;
	dataTypeName: string;
	description: string;
	fieldName: string;
	position: number;
	renderTypeName: string;
	tableColumnId: number;
	format: {
		view: string;
		align: string;
	};
}

export type ColumnsForViewWithQuery = ColumnForViewWithQuery[];
