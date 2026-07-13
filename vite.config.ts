import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const WFS_PATH = '/geoserver/GVP-VOTW/ows'
const wfsQuery = (typeName: string) => new URLSearchParams({
  service: 'WFS',
  version: '1.0.0',
  request: 'GetFeature',
  typeName,
  outputFormat: 'application/json',
}).toString()

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/smithsonian/volcanoes': {
        target: 'https://webservices.volcano.si.edu',
        changeOrigin: true,
        rewrite: () => `${WFS_PATH}?${wfsQuery('GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes')}`,
      },
      '/smithsonian/eruptions': {
        target: 'https://webservices.volcano.si.edu',
        changeOrigin: true,
        rewrite: () => `${WFS_PATH}?${wfsQuery('GVP-VOTW:Smithsonian_VOTW_Holocene_Eruptions')}`,
      },
      '/smithsonian/rss': {
        target: 'https://volcano.si.edu',
        changeOrigin: true,
        rewrite: () => '/news/WeeklyVolcanoRSS.xml',
      },
    },
  },
})
