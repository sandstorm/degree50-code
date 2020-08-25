import React from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import VideoEditor from 'Components/VideoEditor/VideoEditor'
import { TabsTypesEnum } from 'types'
import { selectors } from './SubtitlesSlice'
import { updateSubtitlesAction } from './SubtitlesSaga'

type OwnProps = {}

const mapStateToProps = (state: AppState) => {
    return {
        video: selectors.selectVideo(state),
    }
}
const mapDispatchToProps = {
    updateSubtitles: updateSubtitlesAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const SubtitleEditorApp = ({ video, updateSubtitles }: Props) => {
    if (!video) {
        return null
    }

    const components = [TabsTypesEnum.VIDEO_SUBTITLES]

    return (
        <div className="js-video-editor-container">
            <VideoEditor
                videos={[video]}
                components={components}
                itemUpdateCallback={updateSubtitles}
                itemUpdateCondition={true}
                videoCodesPool={[]}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
