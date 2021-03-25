import React from 'react'

type Props = {
    children: React.ReactNode
}

const MediaLaneToolbarItem = (props: Props) => {
    return <div className="video-editor-toolbar__item">{props.children}</div>
}

export default React.memo(MediaLaneToolbarItem)
