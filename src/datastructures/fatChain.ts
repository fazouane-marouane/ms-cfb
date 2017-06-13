import { joinBuffers } from '../helpers'
import { FatSectorView } from './dataViews'
import { SectorType } from './enums'

/**
 *
 */
class LinkedChainNode {
  constructor(public value: number, public next: LinkedChainNode | null = null) {
  }

  public toArray(): number[] {
    const visitedNodes = new Set<number>()
    const result: number[] = []
    // tslint:disable-next-line:no-var-self
    for (let currentNode: LinkedChainNode | null = this; currentNode !== null; currentNode = currentNode.next) {
      if (visitedNodes.has(currentNode.value)) {
        throw new Error('node in linkedlist already visited.')
      }
      result.push(currentNode.value)
      visitedNodes.add(currentNode.value)
    }

    return result
  }
}

/**
 *
 */
export class FatChain {
  constructor(private fatSectors: FatSectorView[], private sectors: ArrayBuffer[]) {
    this.chains = new Map<number, ArrayBuffer>()
    this.buildChains()
      .forEach((chainIndices: number[]) => {
        const sectorsChain = chainIndices.map((index: number) => sectors[index])
        this.chains.set(chainIndices[0], joinBuffers(sectorsChain))
      })
  }

  private buildChains(): number[][] {
    const chainsNodes = new Map<number, LinkedChainNode>()
    const chainsHeadNodes = new Map<number, LinkedChainNode>()
    const partialFatArrays = this.fatSectors.map((fatSector: FatSectorView) => fatSector.partialArray)
    const completeFatArray: number[] = Array.prototype.concat(...partialFatArrays)

    completeFatArray.forEach((nextIndex: number, currentIndex: number) => {
      if (nextIndex <= SectorType.MAXREGSECT || nextIndex === SectorType.ENDOFCHAIN) {
        let nextNode: LinkedChainNode | null = null
        if (nextIndex !== SectorType.ENDOFCHAIN) {
          if (chainsNodes.has(nextIndex)) {
            nextNode = chainsNodes.get(nextIndex)!
            chainsHeadNodes.delete(nextIndex)
          } else {
            nextNode = new LinkedChainNode(nextIndex, null)
            chainsNodes.set(nextIndex, nextNode)
          }
        }
        let currentNode = chainsNodes.get(currentIndex)
        if (currentNode !== undefined) {
          currentNode.next = nextNode
        } else {
          currentNode = new LinkedChainNode(currentIndex, nextNode)
          chainsNodes.set(currentIndex, currentNode)
          chainsHeadNodes.set(currentIndex, currentNode)
        }
      }
    })

    return Array.from(chainsHeadNodes.values()).map((linkedList: LinkedChainNode) => linkedList.toArray())
  }

  public chains: Map<number, ArrayBuffer>
}
