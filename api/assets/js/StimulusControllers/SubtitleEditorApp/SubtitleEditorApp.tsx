import React from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import VideoEditor from 'Components/VideoEditor/VideoEditor'
import { TabsTypesEnum } from 'types'

type OwnProps = {}

const mapStateToProps = (state: AppState) => {
    return {}
}
const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const SubtitleEditorApp = ({}: Props) => {
    const components = [TabsTypesEnum.VIDEO_SUBTITLES]

    // TODO
    return (
        <VideoEditor
            videos={[]}
            components={components}
            itemUpdateCallback={() => console.log('todo')}
            itemUpdateCondition={true}
            videoCodesPool={[]}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
