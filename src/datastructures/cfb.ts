import { chunkBuffer } from '../helpers';
import { getNextDifatSectorIndex, getPartialDifatArray } from './dataViews';
import { DirectoryDescription } from './directory';
import { buildHierarchy, getDirectoryEntries } from './directoryEntries';
import { DirectoryEntry } from './directoryEntry';
import { SectorType } from './enums';
import { simpleBuildChain } from './fatChain';
import { Header } from './header';

/**
 *
 */
export class CFB {
  constructor(buffer: ArrayBuffer) {
    const header = (this.header = new Header(new DataView(buffer)));
    //header.check()
    this.buildSectors(buffer, header);
    this.buildFatSectors(header);
    this.buildDirectoryEntries(header);
    this.buildMiniFatSectors(header);
    // build the directory's hierarchy

    this.root = buildHierarchy(
      this.directoryEntries,
      header.miniSectorCutoff(),
      this.sectors,
      this.fatSectors,
      this.miniStreamSectors,
      this.miniFatSectors
    );
  }

  /**
   *
   * @param buffer
   * @param header
   */
  private buildSectors(buffer: ArrayBuffer, header: Header): void {
    const sectorSize = header.sectorSize();
    this.sectors = chunkBuffer(new DataView(buffer, sectorSize), sectorSize);
  }

  /**
   *
   * @param header
   */
  private buildFatSectors(header: Header): void {
    const { sectors } = this;
    this.fatSectors = this.getDifatArray(header).map((sectorNumber: number) => {
      return sectors[sectorNumber];
    });
    //this.fatChain = getFatChains(fatSectors, sectors)
  }

  /**
   *
   * @param visitedSectors
   * @param header
   */
  private getDifatArray(header: Header): number[] {
    const result = header.getInitialDifat();
    let currentIndex = header.getStartOfDifat();
    const { sectors } = this;
    const numberOfFatSectors = header.getNumberOfFatSectors();
    while (
      currentIndex !== SectorType.ENDOFCHAIN &&
      result.length < numberOfFatSectors
    ) {
      if (currentIndex >= sectors.length) {
        throw new RangeError(`sector ${currentIndex} out of range`);
      }
      const difatSector = sectors[currentIndex];
      result.push(...getPartialDifatArray(difatSector));
      currentIndex = getNextDifatSectorIndex(difatSector);
    }

    return result.filter(
      (sectorNumber: number) => sectorNumber <= SectorType.MAXREGSECT
    );
  }

  /**
   *
   * @param header
   */
  private buildDirectoryEntries(header: Header): void {
    const startOfDirectoryChain = header.getStartOfDirectoryChain();
    const directoryChainLength = header.getDirectoryChainLength();
    if (startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      const chain = simpleBuildChain(
        startOfDirectoryChain,
        directoryChainLength,
        this.fatSectors,
        this.sectors
      );
      this.directoryEntries = getDirectoryEntries(chain);
    }
  }

  /**
   *
   * @param header
   */
  private buildMiniFatSectors(header: Header): void {
    const startOfMiniFat = header.getStartOfMiniFat();
    const { directoryEntries } = this;
    if (startOfMiniFat !== SectorType.ENDOFCHAIN) {
      // tslint:disable-next-line:no-non-null-assertion
      const miniFatView = simpleBuildChain(
        startOfMiniFat,
        header.getMiniFatChainLength(),
        this.fatSectors,
        this.sectors
      );
      this.miniFatSectors = miniFatView;
      if (directoryEntries.length === 0) {
        throw new Error('MiniStream sector not found');
      }
      const miniStreamStart = directoryEntries[0].getStartingSectorLocation();
      const miniStreamLength = Math.ceil(
        directoryEntries[0].getStreamSize() / header.sectorSize()
      );
      // tslint:disable-next-line:no-non-null-assertion
      const miniStreamView = simpleBuildChain(
        miniStreamStart,
        miniStreamLength,
        this.fatSectors,
        this.sectors
      );
      const sectorSize = header.miniSectorSize();
      const miniStreamSectors: DataView[] = [];
      miniStreamView.forEach((s: DataView) => {
        miniStreamSectors.push(...chunkBuffer(s, sectorSize));
      });
      this.miniStreamSectors = miniStreamSectors;
      //this.miniFatChain = getFatChains([miniFatView], miniStreamSectors)
    }
  }

  public header: Header;

  public sectors!: DataView[];

  public fatSectors!: DataView[];

  public miniStreamSectors!: DataView[];

  public miniFatSectors!: DataView[];

  //public fatChain: Map<number, DataView>

  //public miniFatChain: Map<number, DataView>

  public directoryEntries!: DirectoryEntry[];

  public root: DirectoryDescription;
}
