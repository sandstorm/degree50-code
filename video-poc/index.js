import { initVideoContext, addNode } from './utils.js'
import store from './Redux/Store/store'
import { cutlistSlice } from './Redux/Store/cutlistReducer'

window.onload = function() {
  let { videoCtx, combineEffect } = initVideoContext()

  store.subscribe(() => {
    const cutlist = store.getState().cutlist;

    // Re-initialize video context
    // NOTE: If we don't do this, somehow we get tons of WEBGL error messages and
    // the video might not be played back correctly
    const { videoCtx: newVideoCtx, combineEffect: newCombineEffect } = initVideoContext()
    videoCtx = newVideoCtx
    combineEffect = newCombineEffect

    cutlist.forEach(cut => addNode(cut, videoCtx, combineEffect))
  })

  // simulateLotsOfCuts(50)

  // simulateMultipleLongVideos()

  simulateEdits()
};

const simulateMultipleLongVideos = () => {
  const cutlist = Array.from({ length: 20 }, (_, index) => ({
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    offset: 0, // can be different from start
    start: index * 540,
    duration: 540,
    playbackRate: 1
  }))

  store.dispatch(cutlistSlice.actions.appendNodeList(cutlist))
}

const simulateLotsOfCuts = (amount) => {
  const cutlist = Array.from({ length: amount }, (_, index) => ({
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    offset: 0, // can be different from start
    start: index * 10,
    duration: 10,
    playbackRate: 1
  }))

  store.dispatch(cutlistSlice.actions.appendNodeList(cutlist))
}

const simulateEdits = () => {
  store.dispatch(cutlistSlice.actions.appendNode(
    {
      id: 'a',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 0, // can be different from start
      start: 0,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutlistSlice.actions.appendNode(
    {
      id: 'b',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 0, // can be different from start
      start: 10,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutlistSlice.actions.appendNode(
    {
      id: 'c',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      offset: 0, // can be different from start
      start: 20,
      duration: 20,
      playbackRate: 1
    },
  ))

  store.dispatch(cutlistSlice.actions.appendNode(
    {
      id: 'd',
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 180, // can be different from start
      start: 40,
      duration: 10,
      playbackRate: 1
    },
  ))

  store.dispatch(cutlistSlice.actions.moveNode(
    {
      fromIndex: 2,
      toIndex: 0
    },
  ))

  store.dispatch(cutlistSlice.actions.deleteNode(1))
}
