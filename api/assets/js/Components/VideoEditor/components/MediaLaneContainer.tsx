import React, { memo, useState } from 'react'
import MultiLane from './MultiLane'

const MediaLaneContainer = () => {
    const [showMediaLane, toggleShowMediaLane] = useState(false)
    const handleMediaLaneToggle = () => toggleShowMediaLane(!showMediaLane)

    return (
        <div className="media-lane-container" key="">
            <button className="btn btn-grey btn-sm media-lane-container__toggle" onClick={handleMediaLaneToggle}>
                <i className={showMediaLane ? 'fas fa-chevron-down' : 'fas fa-chevron-up'} />
            </button>

            {showMediaLane && <MultiLane />}
        </div>
    )
}

export default memo(MediaLaneContainer)
