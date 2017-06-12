export class Directory {
  subdirectories: Map<string, Directory> = new Map()

  files: Map<string, ArrayBuffer> = new Map()
}
