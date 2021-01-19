import React from 'react'
import { connect } from 'react-redux'
import { selectConfig, selectUserId, selectReadOnly } from '../../Components/Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { TabsTypesEnum } from '../../../../types'
import VideoEditor from 'Components/VideoEditor'
import { selectCurrentEditorId } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'

type OwnProps = {
    height: number
}

const mapStateToProps = (state: AppState) => {
    return {
        userId: selectUserId(state),
        readOnly: selectReadOnly(state),
        currentEditorId: selectCurrentEditorId(state),
        videoCodesPool: selectConfig(state).videoCodesPool,
        videos: selectConfig(state).videos,
        components: selectConfig(state).components,
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
