export class Directory {
  constructor() {
    this.subdirectories = {}
    this.files = {}
  }

  subdirectories: {
    [name: string]: Directory
  }

  files: {
    [name: string]: ArrayBuffer
  }
}
