import React, { memo, FC } from 'react'
import MultiLane from './MultiLane'

type OwnProps = {
  showMediaLane: boolean
}

const MediaLaneContainer: FC<OwnProps> = (props) => {
  return (
    <div className="media-lane-container" key="">
      {props.showMediaLane && <MultiLane />}
    </div>
  )
}

export default memo(MediaLaneContainer)
