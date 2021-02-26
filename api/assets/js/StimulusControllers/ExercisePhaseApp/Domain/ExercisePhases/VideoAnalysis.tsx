import React from 'react'
import { connect } from 'react-redux'
import { selectors } from '../../Components/Config/ConfigSlice'
import { TabsTypesEnum } from '../../../../types'
import VideoEditor from 'Components/VideoEditor'
import { selectCurrentEditorId } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

type OwnProps = {
    height: number
}

const mapStateToProps = (state: AppState) => {
    return {
        userId: selectors.selectUserId(state),
        readOnly: selectors.selectReadOnly(state),
        currentEditorId: selectCurrentEditorId(state),
        videoCodesPool: selectors.selectVideoCodesPool(state),
        videos: selectors.selectVideos(state),
        components: selectors.selectComponents(state),
    }
}

type Props = ReturnType<typeof mapStateToProps> & OwnProps

const VideoAnalysis: React.FC<Props> = (props) => {
    const videoComponents = Object.values(TabsTypesEnum).filter((tabType) => props.components.includes(tabType))
    const userIsCurrentEditor = props.userId === props.currentEditorId
    const itemUpdateCondition = userIsCurrentEditor && !props.readOnly

    return (
        <VideoEditor
            videos={props.videos}
            components={videoComponents}
            height={props.height}
            itemUpdateCondition={itemUpdateCondition}
            videoCodesPool={props.videoCodesPool}
        />
    )
}

export default connect(mapStateToProps)(VideoAnalysis)
