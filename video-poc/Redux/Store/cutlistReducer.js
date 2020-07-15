import { createSlice } from '@reduxjs/toolkit'

const updateStartingTime = (nodes) => {
  const updatedNodes = nodes.reduce((acc, node, index) => {
    const updatedNode = index === 0
      ? { ...node, start: 0 }
      : { ...node, start: acc.previousNode.start + acc.previousNode.duration }

    return {  nodes: [...acc.nodes, updatedNode], previousNode: updatedNode }
  }, { nodes: [], previousNode: null })

  return updatedNodes.nodes
}

export const cutlistSlice =  createSlice({
      // A name, used in action types
    name: "cutlist",
        // The initial state for the reducer
    initialState: [ ],
    // An object of "case reducers". Key names will be used to generate actions.
    reducers: {
      appendNode: (state, action) => [...state, action.payload],
      appendNodeList: (state, action) => [...state, ...action.payload],
      prependNode: (state, action) => [action.payload, ...state],
      moveNode: (state, action) => {
        const { fromIndex, toIndex } = action.payload
        const node = state[fromIndex]
        const elementsBefore = state.slice(0, fromIndex)
        const elementsAfter = state.slice(fromIndex + 1)
        const withoutElement = [ ...elementsBefore, ...elementsAfter ]
        const withMovedElement = [ ...withoutElement.slice(0, toIndex), node, ...withoutElement.slice(toIndex)]

        return updateStartingTime(withMovedElement)
      },
      splitAtCursor: (state, action) => {
        const time = action.payload
        const nodeUnderCursor = state.filter(node => (node.start <= time) && (node.start + node.duration >= time))[0]

        const leftNode = {
          ...nodeUnderCursor,
          id: `${nodeUnderCursor.id}-L`,
          duration: time - nodeUnderCursor.start
        }

        const rightNode = {
          ...nodeUnderCursor,
          id: `${nodeUnderCursor.id}-R`,
          offset: leftNode.offset + leftNode.duration,
          start: leftNode.start + leftNode.duration,
          duration: nodeUnderCursor.duration - leftNode.duration
        }

        const originalIndex = state.findIndex((node) => node.id === nodeUnderCursor.id)

        return updateStartingTime([
          ...state.slice(0, originalIndex),
          leftNode,
          rightNode,
          ...state.slice(originalIndex + 1)
        ])
      },
      deleteNode: (state, action) => {
        const index = action.payload

        return updateStartingTime([ ...state.slice(0, index), ...state.slice(index + 1)])
      }
    },
    // An additional object of "case reducers", where the keys should be other
    // action types, or a "builder callback" function used to add more reducers
})
