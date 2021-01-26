import React from 'react'
import AnnotationsMenu from './AnnotationsContext/AnnotationsMenu'
import VideoCodesMenu from './VideoCodesContext/VideoCodesMenu'

const Toolbar = () => {
    return (
        <div className="video-editor__toolbar">
            <AnnotationsMenu />
            <VideoCodesMenu />
        </div>
    )
}

export default Toolbar
