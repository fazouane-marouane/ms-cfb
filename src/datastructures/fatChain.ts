import { concat, joinBuffers } from '../helpers'
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
 * @param partialFatArrays
 */
function buildChains(partialFatArrays: ArrayBuffer[]): number[][] {
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

/**
 *
 */
export function getFatChains(partialFatArrays: ArrayBuffer[], sectors: ArrayBuffer[]): Map<number, ArrayBuffer> {
  const chains = new Map<number, ArrayBuffer>()
  buildChains(partialFatArrays)
    .forEach((chainIndices: number[]) => {
      const sectorsChain = chainIndices.map((index: number) => sectors[index])
      chains.set(chainIndices[0], joinBuffers(sectorsChain))
    })

  return chains
}
