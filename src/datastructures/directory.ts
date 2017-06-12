export class VirtualFile {
  constructor(public content: ArrayBuffer, public creationTime: Date | null = null,
    public modificationTime: Date | null = null) {
  }
}

export class VirtualDirectory {
  subdirectories: Map<string, VirtualDirectory> = new Map()

  files: Map<string, VirtualFile> = new Map()
}
