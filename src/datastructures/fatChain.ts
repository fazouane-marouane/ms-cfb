import { concat, joinViews } from '../helpers'
import { getPartialFatArray } from './dataViews'
import { SectorType } from './enums'

/**
 *
 */
class LinkedChainNode {
  constructor(public value: number, public next: LinkedChainNode | null = null) {
  }

  /**
   *
   */
  public toArray(): number[] {
    const visitedNodes = new Set<number>()
    const result: number[] = []
    // tslint:disable-next-line:no-var-self
    for (let currentNode: LinkedChainNode | null = this; currentNode !== null; currentNode = currentNode.next) {
      if (visitedNodes.has(currentNode.value)) {
        throw new Error('List node already visited')
      }
      result.push(currentNode.value)
      visitedNodes.add(currentNode.value)
    }

    return result
  }
}

/**
 *
 * @todo Implement a simplistic version of this function that builds a chain when given a entry sector
 * and a max number of sectors
 *
 * @param partialFatArrays
 */
function strictBuildChains(partialFatArrays: DataView[]): number[][] {
  const chainsNodes = new Map<number, LinkedChainNode>()
  const chainsHeadNodes = new Map<number, LinkedChainNode>()
  const completeFatArray: number[] = concat(partialFatArrays.map(getPartialFatArray))

  completeFatArray.forEach((nextIndex: number, currentIndex: number) => {
    if (nextIndex <= SectorType.MAXREGSECT || nextIndex === SectorType.ENDOFCHAIN) {
      let nextNode: LinkedChainNode | null = null
      if (nextIndex !== SectorType.ENDOFCHAIN) {
        if (chainsNodes.has(nextIndex)) {
          // tslint:disable-next-line:no-non-null-assertion
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

export function simpleBuildChain(startIndex: number, length: number, partialFatArrays: DataView[], sectors: DataView[]): DataView[] {
  const array = partialFatArrays.map(getPartialFatArray)
  const fatSize = partialFatArrays[0].byteLength / 4
  const result = []
  let nextIndex = startIndex
  while (result.length < length || (length === 0 && nextIndex !== SectorType.ENDOFCHAIN)) {
    if (nextIndex > fatSize * partialFatArrays.length || nextIndex > SectorType.MAXREGSECT || nextIndex === SectorType.ENDOFCHAIN) {
      throw new Error('chain too short')
    }
    result.push(sectors[nextIndex])
    nextIndex = array[Math.floor(nextIndex / fatSize)][nextIndex % fatSize]
  }

  return result
}

/**
 * @todo remove the useless joinViews
 */
export function getFatChains(partialFatArrays: DataView[], sectors: DataView[]): Map<number, DataView> {
  const chains = new Map<number, DataView>()
  strictBuildChains(partialFatArrays)
    .forEach((chainIndices: number[]) => {
      const sectorsChain = chainIndices.map((index: number) => sectors[index])
      chains.set(chainIndices[0], joinViews(sectorsChain))
    })

  return chains
}
