export interface IBlobInfo {
  id: () => string
  name: () => string
  filename: () => string
  blob: () => Blob
  base64: () => string
  blobUri: () => string
  uri: () => string | undefined
}

export type ProgressFn = (percent: number) => void
