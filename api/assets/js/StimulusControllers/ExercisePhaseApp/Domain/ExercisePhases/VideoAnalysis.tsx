import React from 'react'
import { connect } from 'react-redux'
import VideoEditor from '../../Components/VideoEditor/VideoEditor'
import { selectConfig } from '../../Components/Config/ConfigSlice'
import { selectSolution } from '../../Components/Solution/SolutionSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

const mapStateToProps = (state: AppState) => {
    return {
        videos: selectConfig(state).videos,
        annotations: selectSolution(state).annotations,
        videoCodes: selectSolution(state).videoCodes,
    }
}

type VideoAnalysisProps = ReturnType<typeof mapStateToProps>

const VideoAnalysis: React.FC<VideoAnalysisProps> = (props) => {
    return <VideoEditor videos={props.videos} />
}

export default connect(mapStateToProps)(VideoAnalysis)
