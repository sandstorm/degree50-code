import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import VideoEditor from 'Components/VideoEditor/VideoEditor'
import { TabsTypesEnum } from 'types'
import { selectors } from './SubtitlesSlice'
import { updateSubtitlesAction } from './SubtitlesSaga'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'

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
    const ref: React.RefObject<HTMLDivElement> = useRef(null)
    let { height } = useDebouncedResizeObserver(ref, 500)
    if (height === 0) {
        height = 400
    }

    if (!video) {
        return null
    }

    const components = [TabsTypesEnum.VIDEO_SUBTITLES]

    return (
        <div className="js-video-editor-container" ref={ref}>
            <VideoEditor
                videos={[video]}
                height={height}
                components={components}
                itemUpdateCallback={updateSubtitles}
                itemUpdateCondition={true}
                videoCodesPool={[]}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
