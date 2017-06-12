import { FatSectorView, SectorView, ChainView } from './dataViews'
import { SectorType } from './enums'

export class FatChain {
  constructor(private fatSectors: FatSectorView[], private sectors: SectorView[]) {
    this.chains = new Map<number, ChainView>()
    this.buildChains()
      .forEach(chainIndices => {
        let sectorsChain = chainIndices.map(index => sectors[index])
        this.chains.set(chainIndices[0], new ChainView(sectorsChain))
      })
  }

  private buildChains(): number[][] {
    let chainsNodes = new Map<number, LinkedChainNode>()
    let chainsHeadNodes = new Map<number, LinkedChainNode>()
    let partialFatArrays = this.fatSectors.map(fatSector => fatSector.partialArray)
    let completeFatArray: number[] = Array.prototype.concat(...partialFatArrays)

    completeFatArray.forEach((nextIndex, currentIndex) => {
      if (nextIndex <= SectorType.MAXREGSECT || nextIndex === SectorType.ENDOFCHAIN) {
        let nextNode: LinkedChainNode | null = null
        if (nextIndex !== SectorType.ENDOFCHAIN) {
          if (chainsNodes.has(nextIndex)) {
            nextNode = chainsNodes.get(nextIndex)!
            chainsHeadNodes.delete(nextIndex)
          }
          else {
            nextNode = new LinkedChainNode(nextIndex, null)
            chainsNodes.set(nextIndex, nextNode)
          }
        }
        let currentNode = chainsNodes.get(currentIndex)
        if (currentNode) {
          currentNode.next = nextNode
        }
        else {
          currentNode = new LinkedChainNode(currentIndex, nextNode)
          chainsNodes.set(currentIndex, currentNode)
          chainsHeadNodes.set(currentIndex, currentNode)
        }
      }
    })
    return Array.from(chainsHeadNodes.values()).map(linkedList => linkedList.toArray())
  }

  public chains: Map<number, ChainView>
}

class LinkedChainNode {
  constructor(public value: number, public next: LinkedChainNode | null = null) {
  }

  public toArray(): number[] {
    let visitedNodes = new Set<number>()
    let result: number[] = []
    for (let currentNode: LinkedChainNode | null = this; currentNode; currentNode = currentNode.next) {
      if (visitedNodes.has(currentNode.value)) {
        throw new Error('node in linkedlist chain already visisted.')
      }
      result.push(currentNode.value)
      visitedNodes.add(currentNode.value)
    }
    return result
  }
}
