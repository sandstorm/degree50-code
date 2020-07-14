import React from 'react'
import { connect } from 'react-redux'
import SubtitleEditor from '../../Components/SubtitleEditor/SubtitleEditor'
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
    return <SubtitleEditor videos={props.videos} subtitles={props.annotations} videoCodes={props.videoCodes} />
}

export default connect(mapStateToProps)(VideoAnalysis)
