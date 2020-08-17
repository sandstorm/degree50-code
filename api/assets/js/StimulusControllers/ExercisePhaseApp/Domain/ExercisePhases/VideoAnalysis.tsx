import React from 'react'
import { connect } from 'react-redux'
import VideoEditor from '../../Components/VideoEditor/VideoEditor'
import { selectConfig } from '../../Components/Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { TabsTypesEnum } from '../../Store/ComponentTypesEnum'

const mapStateToProps = (state: AppState) => {
    return {
        videos: selectConfig(state).videos,
        components: selectConfig(state).components,
    }
}

type VideoAnalysisProps = ReturnType<typeof mapStateToProps>

const VideoAnalysis: React.FC<VideoAnalysisProps> = (props) => {
    const videoComponents = Object.values(TabsTypesEnum).filter((tabType) => props.components.includes(tabType))

    return <VideoEditor videos={props.videos} components={videoComponents} />
}

export default connect(mapStateToProps)(VideoAnalysis)
