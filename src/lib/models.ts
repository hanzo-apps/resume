import type { BaseRecord } from '@hanzo/base/react'

/** The `profile` collection row — the resume header (one live row per org). */
export interface Profile extends BaseRecord {
  name: string
  title: string
  summary: string
}

/** One `entries` row — a single line item, grouped under `section`. */
export interface Entry extends BaseRecord {
  section: string
  title: string
  detail: string
  when: string
}
