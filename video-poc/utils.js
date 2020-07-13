import VideoContext from 'videocontext'
import store from './Redux/Store/store'
import { cutlistSlice } from './Redux/Store/cutlistReducer'

export const initVideoContext = () => {
  const canvas = document.getElementById("canvas");
  const videoCtx = new VideoContext(canvas);
  const combineEffect = videoCtx.compositor(VideoContext.DEFINITIONS.COMBINE);

  // connect all sources
  combineEffect.connect(videoCtx.destination);

  const playButton = document.getElementById("play-button");
  playButton.onclick = function() {
    if (videoCtx.currentTime >= videoCtx.duration) {
      videoCtx.currentTime = 0;
    }

    console.log(videoCtx)
    videoCtx.play();
  };

  const pauseButton = document.getElementById("pause-button");
  pauseButton.onclick = videoCtx.pause.bind(videoCtx);

  const screenshotButton = document.getElementById("screenshot-button");
  screenshotButton.onclick = function() {
    const img = canvas.toDataURL("image/jpeg", 1.0);
    document.getElementById("snapshot").setAttribute("src", img);
  };

  const splitButton = document.getElementById('split-button')
  splitButton.onclick = () => {
    store.dispatch(cutlistSlice.actions.splitAtCursor(videoCtx.currentTime))
  }

  // init timeline
  function render() {
    initTimestampDiv(videoCtx);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  //Set-up the visualisation using the convienience function in ../js/utils.js
  InitVisualisations(videoCtx, "graph-canvas", "visualisation-canvas");

  return { videoCtx, combineEffect }
}

function InitVisualisations(videoCtx, graphCanvasID, visualisationCanvasID) {
  /****************************
   * GUI setup
   *****************************/
  /*
   * Create an interactive visualisation canvas.
   */
  var visualisationCanvas = document.getElementById(visualisationCanvasID);
  RefreshGraph(videoCtx, graphCanvasID);

  //visualisationCanvas.height = 20;
  //visualisationCanvas.width = 390;
  //Setup up a render function so we can update the playhead position.
  function render() {
    //VideoCompositor.renderPlaylist(playlist, visualisationCanvas, videoCompositor.currentTime);
    VideoContext.visualiseVideoContextTimeline(
      videoCtx,
      visualisationCanvas,
      videoCtx.currentTime
    );
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  //catch mouse events to we can scrub through the timeline.
  visualisationCanvas.addEventListener(
    "mousedown",
    function(evt) {
      var x;
      if (evt.x !== undefined) {
        x = evt.x - visualisationCanvas.offsetLeft;
      } else {
        //Fix for firefox
        x =
          evt.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
      }
      var secondsPerPixel = videoCtx.duration / visualisationCanvas.width;
      if (secondsPerPixel * x !== Infinity)
        videoCtx.currentTime = secondsPerPixel * x;
    },
    false
  );
}

function RefreshGraph(videoCtx, graphCanvasID) {
  var graphCanvas = document.getElementById(graphCanvasID);
  VideoContext.visualiseVideoContextGraph(videoCtx, graphCanvas);
}

export const addNode = (node, videoCtx, combineEffect) => {
  const videoNode = videoCtx.video(node.url, node.offset, 4, {
    volume: 0.6,
    loop: false
  });
  videoNode._playbackRate = node.playbackRate;
  videoNode.start(node.start);
  videoNode.stop(node.start + node.duration);

  videoNode.connect(combineEffect);

  return videoNode
};

const initTimestampDiv = function(videoCtx) {
  const durationSpan = document.getElementById("duration");
  durationSpan.innerText = Number.parseFloat(videoCtx.duration).toPrecision(2);

  const currentTimeSpan = document.getElementById("current-time");
  currentTimeSpan.innerText = Number.parseFloat(
    videoCtx.currentTime
  ).toPrecision(2);
};
