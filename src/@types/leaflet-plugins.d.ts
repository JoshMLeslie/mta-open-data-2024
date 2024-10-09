/** Lat, Lng, Intensity: [0.0..1.0] */
export type HeatMapDatum = number[];
export type HeatMapData = HeatMapDatum[];
export type HeatMapOptions = Partial<{
	/**
	 * The radius of influence of each data point, in pixels.
	 * @default 15
	 */
	radius: number;

	/**
	 * Controls the blurring effect, where larger values produce a smoother heatmap.
	 */
	blur: number;

	/**
	 * An array of color gradients to apply to the heatmap.
	 */
	gradient: string[];

	/**
	 * The maximum opacity (maxOpacity) value for the heatmap, ranging from 0 (transparent) to 1 (opaque).
	 * @default 1.0
	 * @max 1.0
	 */
	max?: number;

	/**
	 * Defaults to the maximum zoom level of the map.
	 */
	maxZoom?: number;

	/**
	 * The minimum opacity value for the heatmap, ranging from 0 (transparent) to 1 (opaque).
	 * @default 0.05
	 * @max 1.0
	 */
	minOpacity?: number;
}>;

declare namespace L {
	function HeatLayer(...args: any[]): L.Class;
	function heatLayer(t: HeatMapData, i: HeatMapOptions): L.Layer;
}
