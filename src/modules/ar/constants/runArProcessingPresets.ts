/**
 * Preset merchant / outlet pairs for “Run AR processing”.
 * Labels are display-only; IDs are sent to `POST /ar-entries/run`.
 */
export interface RunArProcessingPreset {
  /** Stable key for form Select `value`. */
  key: string
  merchantId: string
  outletId: string
  merchantDisplayName: string
  outletDisplayName: string
}

export const RUN_AR_PROCESSING_PRESETS: readonly RunArProcessingPreset[] = [
  {
    key: 'taj-amanda',
    merchantId: '7b13337a7e08b951a92d87c5',
    outletId: '0d5100d426098a702952b903',
    merchantDisplayName: 'Taj',
    outletDisplayName: 'Amanda',
  },
]

export function findRunArPresetByKey(key: string): RunArProcessingPreset | undefined {
  return RUN_AR_PROCESSING_PRESETS.find((p) => p.key === key)
}
