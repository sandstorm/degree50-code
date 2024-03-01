import React, { FC, memo, useState } from 'react'
import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import MediaLaneContainer from './components/MediaLaneContainer'
import OverlayContainer from 'Components/ToolbarItems/components/OverlayContainer'
import Toolbar from './components/Toolbar'
import { useShortCuts } from 'Components/ToolbarItems/ShortCutsContext/useShortCuts'

type Props = {
  videos: Array<Video>
}

const VideoEditor: FC<Props> = (props) => {
  const firstVideo = props.videos[0]

  useShortCuts()

  const [showMediaLane, toggleShowMediaLane] = useState(false)
  const handleMediaLaneToggle = () => toggleShowMediaLane(!showMediaLane)

  // todo toggle medial lane from toolbar
  return (
    <div className="video-editor" data-test-id="videoEditor">
      <ConnectedVideoJSPlayer
        videoJsOptions={{
          autoplay: false,
          controls: true,
          fluid: false,
          // @ts-ignore
          fill: true,
        }}
        videoMap={firstVideo}
      />
      <Toolbar>
        <div className="video-editor__menu video-editor__menu--right">
          <button
            className="button button--type-primary video-editor__toolbar__button video-editor__toolbar__button--with-text"
            title="Zeitleiste anzeigen/verbergen"
            aria-label={
              showMediaLane ? 'Zeitleiste verbergen' : 'Zeitleiste anzeigen'
            }
            onClick={handleMediaLaneToggle}
          >
            <i
              className={
                showMediaLane ? 'fas fa-chevron-down' : 'fas fa-chevron-up'
              }
            />
            {showMediaLane ? 'Zeitleiste verbergen' : 'Zeitleiste anzeigen'}
          </button>
        </div>
      </Toolbar>
      <OverlayContainer />
      <MediaLaneContainer showMediaLane={showMediaLane} />
    </div>
  )
}

export default memo(VideoEditor)
