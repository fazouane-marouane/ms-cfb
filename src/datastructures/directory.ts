/**
 *
 */
export class VirtualFile {
  constructor(public content: ArrayBuffer, public creationTime: Date | null = null,
    public modificationTime: Date | null = null) {
  }
}

/**
 *
 */
export class VirtualDirectory {
  public subdirectories: Map<string, VirtualDirectory> = new Map()

  public files: Map<string, VirtualFile> = new Map()
}
