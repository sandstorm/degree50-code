import React from 'react'
import AnnotationsMenu from '../AnnotationsContext/AnnotationsMenu'
import AufgabeMenu from '../Aufgabe/AufgabeMenu'
import CuttingMenu from '../CuttingContext/CuttingMenu'
import TeamMenu from '../Team/TeamMenu'
import VideoCodesMenu from '../VideoCodesContext/VideoCodesMenu'

const Toolbar = () => {
    return (
        <div className="video-editor__toolbar">
            <AnnotationsMenu />
            <VideoCodesMenu />
            <CuttingMenu />
            <AufgabeMenu />
            <TeamMenu />
        </div>
    )
}

export default Toolbar
