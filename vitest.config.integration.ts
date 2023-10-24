/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { InlineConfig } from 'vitest'
import vitestUnitConfig from './vitest.config'

function setupFilesWithoutMswSetup() {
  const setupFiles = vitestUnitConfig.test!.setupFiles! as string[]
  return setupFiles.filter(file => file !== 'test/vitest/setup-msw.ts')
}

const integrationTestOptions: Partial<InlineConfig> = {
  include: ['./**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  // Avoid msw in integration tests
  setupFiles: setupFilesWithoutMswSetup(),
  globalSetup: ['./test/anvil/anvil-global-setup.ts'],
  testTimeout: 15_000,
  // Consider disabling threads if we detect problems with anvil
  // threads: false,
}

const integrationConfig = vitestUnitConfig

integrationConfig.test = {
  ...integrationConfig.test,
  ...integrationTestOptions,
}

export default integrationConfig