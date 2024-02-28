import React, { memo, useState } from 'react'
import MultiLane from './MultiLane'

const MediaLaneContainer = () => {
  const [showMediaLane, toggleShowMediaLane] = useState(false)
  const handleMediaLaneToggle = () => toggleShowMediaLane(!showMediaLane)

  return (
    <div className="media-lane-container" key="">
      <button
        className="button button--type-grey button--size-small media-lane-container__toggle"
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
      </button>

      {showMediaLane && <MultiLane />}
    </div>
  )
}

export default memo(MediaLaneContainer)
