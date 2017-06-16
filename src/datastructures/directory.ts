/**
 * Contains file content with some metadata
 */
export class FileDescription {
  /**
   * @param content The raw file buffer
   * @param creationTime The creation time for the file in UTC
   * @param modificationTime The modification time of the file in UTC
   */
  constructor(
    public content: ArrayBuffer,
    public creationTime: Date | null = null,
    public modificationTime: Date | null = null) {}
}

/**
 * Describes a directory as a collection of sub-directories and a collection of files
 */
export class DirectoryDescription {
  /**
   * Matchs subdirectory names with subdirectory description
   */
  public subdirectories: Map<string, DirectoryDescription> = new Map()

  /**
   * Matchs file names with file descriptions
   */
  public files: Map<string, FileDescription> = new Map()
}
