# Global Volcano Explorer

Responsive React + TypeScript application based on current volcanological data from the Smithsonian Global Volcanism Program. On startup, it fetches two WFS GeoJSON datasets and the Weekly Volcano RSS feed. The data remains only in the browser's memory—the application does not use a database, `localStorage`, a Service Worker, or persistent caching.

The interactive map uses MapLibre GL JS with globe projection and the Sentinel-2 Cloudless 2020 satellite layer provided by EOX. All volcano, eruption, and activity-report records continue to come exclusively from Smithsonian GVP.

## Getting started

```bash
pnpm install
pnpm dev
```

Vite provides a same-origin `/smithsonian/*` proxy because the Smithsonian sources do not expose consistent CORS headers for direct browser requests. The proxy neither stores nor transforms the data; it forwards requests exclusively to the specified `volcano.si.edu` and `webservices.volcano.si.edu` endpoints. For a static deployment, these two routes must be mapped by the hosting layer.

## Satellite basemap

The satellite imagery is provided by [EOxCloudless](https://cloudless.eox.at/) and contains modified Copernicus Sentinel data 2020. The freely accessible 2020 WMTS layer is licensed for non-commercial use under CC BY-NC-SA 4.0 and requires visible attribution, which the map displays automatically. Commercial deployments require an appropriate EOX license or a different licensed basemap provider.

## Verification

```bash
pnpm test
pnpm build
```
