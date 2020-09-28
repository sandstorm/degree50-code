import { initVideoContext, addNode } from './utils.js'
import store from './Redux/Store/store'
import { cutListSlice } from './Redux/Store/cutListReducer'

window.onload = function() {
  let { videoCtx, combineEffect } = initVideoContext()

  store.subscribe(() => {
    const cutList = store.getState().cutList;

    // Re-initialize video context
    // NOTE: If we don't do this, somehow we get tons of WEBGL error messages and
    // the video might not be played back correctly
    const { videoCtx: newVideoCtx, combineEffect: newCombineEffect } = initVideoContext()
    videoCtx = newVideoCtx
    combineEffect = newCombineEffect

    cutList.forEach(cut => addNode(cut, videoCtx, combineEffect))
  })

  // simulateLotsOfCuts(50)

  // simulateMultipleLongVideos()

  simulateEdits()
};

const simulateMultipleLongVideos = () => {
  const cutList = Array.from({ length: 20 }, (_, index) => ({
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    offset: 0, // can be different from start
    start: index * 540,
    duration: 540,
    playbackRate: 1
  }))

  store.dispatch(cutListSlice.actions.appendNodeList(cutList))
}

const simulateLotsOfCuts = (amount) => {
  const cutList = Array.from({ length: amount }, (_, index) => ({
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    offset: 0, // can be different from start
    start: index * 10,
    duration: 10,
    playbackRate: 1
  }))

  store.dispatch(cutListSlice.actions.appendNodeList(cutList))
}

const simulateEdits = () => {
  store.dispatch(cutListSlice.actions.appendNode(
    {
      id: 'a',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 0, // can be different from start
      start: 0,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutListSlice.actions.appendNode(
    {
      id: 'b',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 0, // can be different from start
      start: 10,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutListSlice.actions.appendNode(
    {
      id: 'c',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      offset: 0, // can be different from start
      start: 20,
      duration: 20,
      playbackRate: 1
    },
  ))

  store.dispatch(cutListSlice.actions.appendNode(
    {
      id: 'd',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 180, // can be different from start
      start: 40,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutListSlice.actions.moveNode(
    {
      fromIndex: 2,
      toIndex: 0
    },
  ))

  store.dispatch(cutListSlice.actions.deleteNode(1))
}
