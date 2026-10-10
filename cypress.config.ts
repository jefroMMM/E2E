import { defineConfig } from 'cypress'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default defineConfig({
  // Electron is deprecated as of Cypress 16.
  defaultBrowser: 'chrome',
  video: true,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'reports/e2e',
    reportFilename: 'index',
    reportTitle: 'Pokédex — pruebas E2E',
    reportPageTitle: 'Resultados de Cypress',
    overwrite: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: true,
  },
  e2e: {
    setupNodeEvents(on) {
      require('cypress-mochawesome-reporter/plugin')(on)
    },
    // A port of its own, so a run never attaches to another app left on 3000.
    baseUrl: 'http://localhost:5174',
    // Above the `md` breakpoint, where the type filter is the rail rather than
    // the dropdown. Specs that need the small screen set it themselves.
    viewportWidth: 1280,
    viewportHeight: 800,
    // Route loaders run on the server during SSR, out of reach of cy.intercept,
    // so these specs exercise the live PokeAPI. Retries absorb its occasional
    // slow answer in CI; interactive runs keep failing on the first attempt.
    retries: { runMode: 2, openMode: 0 },
  },
})
