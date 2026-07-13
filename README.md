# Global Volcano Explorer

Responsive React + TypeScript application based exclusively on current data from the Smithsonian Global Volcanism Program. On startup, it fetches two WFS GeoJSON datasets and the Weekly Volcano RSS feed. The data remains only in the browser's memory—the application does not use a database, `localStorage`, a Service Worker, or persistent caching.

## Getting started

```bash
pnpm install
pnpm dev
```

Vite provides a same-origin `/smithsonian/*` proxy because the Smithsonian sources do not expose consistent CORS headers for direct browser requests. The proxy neither stores nor transforms the data; it forwards requests exclusively to the specified `volcano.si.edu` and `webservices.volcano.si.edu` endpoints. For a static deployment, these two routes must be mapped by the hosting layer.

## Verification

```bash
pnpm test
pnpm build
```
