declare module "leaflet" {
  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
  }

  export interface CircleMarkerOptions {
    radius?: number;
  }
}

// Fix other Leaflet-related typings as needed