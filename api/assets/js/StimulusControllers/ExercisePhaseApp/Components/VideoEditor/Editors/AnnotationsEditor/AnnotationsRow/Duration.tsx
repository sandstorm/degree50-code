import React from 'react'

type Props = {
    duration: string
}

const Duration = ({ duration }: Props) => {
    return (
        <div className="video-editor__media-item-list__column video-editor__media-item-list__column--duration">
            {duration}
        </div>
    )
}

export default React.memo(Duration)
