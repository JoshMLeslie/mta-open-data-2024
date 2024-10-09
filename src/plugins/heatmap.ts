/* eslint-disable no-unused-expressions */
/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/

/** extracted from https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js */

import L from 'leaflet';
import {
	HeatMapData,
	HeatMapDatum,
	HeatMapOptions,
} from '../@types/leaflet-plugins';

export interface HeatLayerInstance extends L.Layer {
	setLatLngs(latlngs: HeatMapData, max?: number): this;
	addLatLng(latlngs: HeatMapDatum, max?: number): this;
	setOptions(options: HeatMapOptions): this;
	redraw(): this;
	onAdd(map: L.Map): this;
	onRemove(map: L.Map): this;
	addTo(map: L.Map): this;
}

interface HeatLayerCtor {
	new (t: HeatMapData, i: HeatMapOptions): HeatLayerInstance;
}
type Gradient = {[key: number]: string};

class SimpleHeat {
	_max = 1;
	_data: HeatMapData = [];
	defaultRadius = 25;
	defaultGradient: Gradient = {
		0.4: 'blue',
		0.6: 'cyan',
		0.7: 'lime',
		0.8: 'yellow',
		1.0: 'red',
	};
	_ctx!: CanvasRenderingContext2D;
	_canvas!: HTMLCanvasElement;
	_width = 0;
	_height = 0;
	_circle: any;
	_r: number = 0;
	_grad: any;
	_map: L.Map | undefined;

	constructor(canvas: string | HTMLCanvasElement) {
		const _canvas =
			typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
		if (!_canvas) {
			console.error('unable to get canvas');
			return;
		}
		this._canvas = _canvas as HTMLCanvasElement;

		const ctx = this._canvas.getContext('2d', {willReadFrequently: true});
		if (!ctx) {
			console.error('unable to get ctx');
			return;
		}
		this._ctx = ctx;
		this._width = this._canvas.width;
		this._height = this._canvas.height;
	}
	data(data: HeatMapData) {
		this._data = data;
		return this;
	}
	max(max: number) {
		this._max = max;
		return this;
	}
	addPoint(point: Required<L.LatLngTuple>) {
		this._data.push(point);
		return this;
	}
	clear() {
		this._data = [];
		return this;
	}
	radius(r: number, blur = 15) {
		// create a grayscale blurred circle image that we'll use for drawing points
		const circle = this._createCanvas();
		this._circle = circle;
		const ctx = circle.getContext('2d', {willReadFrequently: true});
		if (!ctx) {
			throw new Error('Could not get canvas context');
		}
		const r2 = r + blur;
		this._r = r2;

		circle.width = circle.height = r2 * 2;

		ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
		ctx.shadowBlur = blur;
		ctx.shadowColor = 'black';

		ctx.beginPath();
		ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();

		return this;
	}
	resize() {
		this._width = this._canvas.width;
		this._height = this._canvas.height;
	}
	gradient(grad: Gradient) {
		// create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
		const canvas = this._createCanvas();
		const ctx = canvas.getContext('2d', {willReadFrequently: true});
		if (!ctx) {
			throw new Error('Could not get canvas context');
		}
		const gradient = ctx.createLinearGradient(0, 0, 0, 256);

		canvas.width = 1;
		canvas.height = 256;

		for (const i in grad) {
			gradient.addColorStop(+i, grad[i]);
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 1, 256);

		this._grad = ctx.getImageData(0, 0, 1, 256).data;

		return this;
	}
	draw(minOpacity: number) {
		if (!this._circle) this.radius(this.defaultRadius);
		if (!this._grad) this.gradient(this.defaultGradient);

		var ctx = this._ctx;

		ctx.clearRect(0, 0, this._width, this._height);

		// draw a grayscale heatmap by putting a blurred circle at each data point
		for (var i = 0, len = this._data.length, p; i < len; i++) {
			p = this._data[i];
			ctx.globalAlpha = Math.min(
				Math.max(
					p[2] / this._max,
					minOpacity === undefined ? 0.05 : minOpacity
				),
				1
			);
			ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
		}

		// colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
		const colored = ctx.getImageData(0, 0, this._width, this._height);
		this._updateColorData(colored.data, this._grad);
		ctx.putImageData(colored, 0, 0);

		return this;
	}
	/** ! mutates ! */
	_updateColorData(pixels: ImageData['data'], gradient: Gradient) {
		for (var i = 0, len = pixels.length, j; i < len; i += 4) {
			j = pixels[i + 3] * 4; // get gradient color from opacity value

			if (!j) {
				return;
			}
			
			// not sure about this but it seems to work
			pixels[i] = gradient[j] as unknown as number;
			pixels[i + 1] = gradient[j + 1] as unknown as number;
			pixels[i + 2] = gradient[j + 2] as unknown as number;
		}
	}
	_createCanvas() {
		if (typeof document === 'undefined') {
			throw new Error('Must be in the client');
		} else {
			return document.createElement('canvas');
		}
	}
}

/*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/
const HeatLayer: HeatLayerCtor = L.Layer.extend({
	initialize: function (t: L.LatLngTuple, i: any) {
		this._latlngs = t;
		L.setOptions(this, i);
		return this;
	},
	setLatLngs: function (t: L.LatLngTuple) {
		this._latlngs = t;
		this.redraw();
		return this;
	},
	addLatLng: function (t: any) {
		this._latlngs.push(t);
		this.redraw();
		return this;
	},
	setOptions: function (t: any) {
		L.setOptions(this, t);
		if (this._heat) {
			this._updateOptions();
		}
		this.redraw();
		return this;
	},
	redraw: function () {
		if (!this._heat || this._frame || this._map._animating) {
			this._frame = L.Util.requestAnimFrame(this._redraw, this);
		}
		return this;
	},
	onAdd: function (t: L.Map) {
		this._map = t;
		if (!this._canvas) this._initCanvas();
		t.getPanes().overlayPane.appendChild(this._canvas);
		t.on('moveend', this._reset, this);
		if (t.options.zoomAnimation && L.Browser.any3d) {
			t.on('zoomanim', this._animateZoom, this);
		}
		this._reset();
	},
	onRemove: function (t: L.Map) {
		t.getPanes().overlayPane.removeChild(this._canvas);
		t.off('moveend', this._reset, this);
		if (t.options.zoomAnimation) {
			t.off('zoomanim', this._animateZoom, this);
		}
	},
	addTo: function (t: L.Map) {
		t.addLayer(this);
		return this;
	},
	_initCanvas: function () {
		const t = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer');
		this._canvas = t;
		const i = L.DomUtil.testProp([
			'transformOrigin',
			'WebkitTransformOrigin',
			'msTransformOrigin',
		]);
		if (!i) {
			throw new Error('Your browser does not support CSS transforms');
		}
		t.style.setProperty(i, '50% 50%');
		const a = this._map.getSize();
		t.width = a.x;
		t.height = a.y;
		const s: boolean = this._map.options.zoomAnimation && L.Browser.any3d;
		L.DomUtil.addClass(t, 'leaflet-zoom-' + (s ? 'animated' : 'hide'));
		this._heat = new SimpleHeat(t);
		this._updateOptions();
	},
	_updateOptions: function () {
		this._heat.radius(
			this.options.radius || this._heat.defaultRadius,
			this.options.blur
		);
		if (this.options.gradient) {
			this._heat.gradient(this.options.gradient);
		}
		if (this.options.max) {
			this._heat.max(this.options.max);
		}
	},
	_reset: function () {
		const mapZero = this._map.containerPointToLayerPoint([0, 0]);
		L.DomUtil.setPosition(this._canvas, mapZero);
		const mapSize = this._map.getSize();
		if (this._heat._width !== mapSize.x) {
			this._canvas.width = mapSize.x;
			this._heat._width = mapSize.x;
		}
		if (this._heat._height !== mapSize.y) {
			this._canvas.height = mapSize.y;
			this._heat._height = mapSize.y;
		}
		this._redraw();
	},
	_redraw: function () {
		var t,
			i,
			a,
			s,
			e,
			n,
			h,
			o,
			r,
			d = [],
			_ = this._heat._r,
			l = this._map.getSize(),
			m = new L.Bounds(L.point([-_, -_]), l.add([_, _])),
			c = void 0 === this.options.max ? 1 : this.options.max,
			u =
				void 0 === this.options.maxZoom
					? this._map.getMaxZoom()
					: this.options.maxZoom,
			f = 1 / Math.pow(2, Math.max(0, Math.min(u - this._map.getZoom(), 12))),
			g = _ / 2,
			p: string | any[] = [],
			v = this._map._getMapPanePos(),
			w = v.x % g,
			y = v.y % g;
		for (t = 0, i = this._latlngs.length; i > t; t++)
			if (
				((a = this._map.latLngToContainerPoint(this._latlngs[t])),
				m.contains(a))
			) {
				e = Math.floor((a.x - w) / g) + 2;
				n = Math.floor((a.y - y) / g) + 2;
				var x =
					void 0 !== this._latlngs[t].alt
						? this._latlngs[t].alt
						: void 0 !== this._latlngs[t][2]
						? +this._latlngs[t][2]
						: 1;
				r = x * f;
				p[n] = p[n] || [];
				s = p[n][e];
				if (s) {
					s[0] = (s[0] * s[2] + a.x * r) / (s[2] + r);
					s[1] = (s[1] * s[2] + a.y * r) / (s[2] + r);
					s[2] += r;
				} else {
					p[n][e] = [a.x, a.y, r];
				}
			}
		for (t = 0, i = p.length; i > t; t++) {
			if (p[t]) {
				for (h = 0, o = p[t].length; o > h; h++) {
					s = p[t][h];
					if (s) {
						d.push([Math.round(s[0]), Math.round(s[1]), Math.min(s[2], c)]);
					}
				}
			}
		}
		this._heat.data(d).draw(this.options.minOpacity);
		this._frame = null;
	},
	_animateZoom: function (t: {zoom: any; center: any}) {
		const i = this._map.getZoomScale(t.zoom);
		const a: L.Point = this._map
			._getCenterOffset(t.center)
			._multiplyBy(-i)
			.subtract(this._map._getMapPanePos());
		if (!L.DomUtil.setTransform) {
			throw new Error('Your browser does not support CSS transforms.');
		}
		L.DomUtil.setTransform(this._canvas, a, i);
	},
});

export default HeatLayer;
