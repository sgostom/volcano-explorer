# Global Volcano Explorer

Responsive React + TypeScript application based on current volcanological data from the Smithsonian Global Volcanism Program. During local development, it fetches two WFS GeoJSON datasets and the Weekly Volcano RSS feed through the Vite proxy. The GitHub Pages deployment loads a same-origin Smithsonian snapshot generated weekly by GitHub Actions. After loading, application state remains only in the browser's memory—the application does not use a database, `localStorage`, or a Service Worker.

The interactive map uses MapLibre GL JS with globe projection and the Sentinel-2 Cloudless 2020 satellite layer provided by EOX. All volcano, eruption, and activity-report records continue to come exclusively from Smithsonian GVP.

## Getting started

```bash
pnpm install
pnpm dev
```

Vite provides a same-origin `/smithsonian/*` proxy because the Smithsonian sources do not expose consistent CORS headers for direct browser requests. The proxy neither stores nor transforms the data; it forwards requests exclusively to the specified `volcano.si.edu` and `webservices.volcano.si.edu` endpoints.

## GitHub Pages deployment

The `Deploy GitHub Pages` workflow downloads and validates the three Smithsonian sources, runs the tests, builds the application, and deploys the result. It runs after pushes to `main`, can be started manually, and refreshes the snapshot every Monday at 03:17 UTC. A manual run accepts an optional semantic version and deploys its `vX.Y.Z` tag; an empty value deploys `main`. If downloading, validation, testing, or building fails, the deployment job does not run and the previously published site remains available.

The generated snapshot is included only in the Pages artifact and is ignored by Git. Its manifest records the retrieval time and exact Smithsonian source URLs; the interface displays that retrieval time. Build the Pages version locally with:

```bash
pnpm build:pages
```

## Satellite basemap

The satellite imagery is provided by [EOxCloudless](https://cloudless.eox.at/) and contains modified Copernicus Sentinel data 2020. The freely accessible 2020 WMTS layer is licensed for non-commercial use under CC BY-NC-SA 4.0 and requires visible attribution, which the map displays automatically. Commercial deployments require an appropriate EOX license or a different licensed basemap provider.

## Interface languages

The interface supports Polish and English through a typed in-memory translation catalog. The initial language follows the browser preference and can be changed from the header. The selection is not persisted in `localStorage` or any other cache.

## Versioning and releases

The project follows Semantic Versioning. Pull requests are merged manually with the squash method. After a pull request reaches `main`, the `Version and release` workflow adds a separate version commit directly to `main`, creates the matching version tag and GitHub Release, and redeploys GitHub Pages. The pull request title determines the next version:

- `fix:` creates a patch release, such as `1.0.0` to `1.0.1`.
- `feat:` creates a minor release, such as `1.0.0` to `1.1.0`.
- A `BREAKING CHANGE:` footer or `!` after the commit type creates a major release, such as `1.0.0` to `2.0.0`.
- Other pull request title types, including `ci:`, `docs:`, `test:`, `chore:`, and `build:`, do not create a version commit or release.

The release commit uses `chore: release vX.Y.Z (PR #N)` so every version has a direct reference to its source pull request. The repository permits only squash merging and requires pull requests for normal changes to `main`. A dedicated write-enabled deploy key is the only ruleset bypass and is stored as the `VERSION_BUMP_DEPLOY_KEY` Actions secret, allowing the workflow to push only the automated version commit without another pull request.

## Verification

```bash
pnpm test
pnpm build
```
