import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import VideoEditor from 'Components/VideoEditor/VideoEditor'
import { TabsTypesEnum } from 'types'
import { selectors } from './SubtitlesSlice'
import { updateSubtitlesAction } from './SubtitlesSaga'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'

const mapStateToProps = (state: AppState) => {
    return {
        video: selectors.selectVideo(state),
    }
}
const mapDispatchToProps = {
    updateSubtitles: updateSubtitlesAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const SubtitleEditorApp = ({ video, updateSubtitles }: Props) => {
    const ref: React.RefObject<HTMLDivElement> = useRef(null)
    const { height } = useDebouncedResizeObserver(ref, 500)
    const heightOrDefault = height === 0 ? 400 : height

    if (!video) {
        return null
    }

    const components = [TabsTypesEnum.VIDEO_SUBTITLES]

    return (
        <div className="js-video-editor-container" ref={ref}>
            <VideoEditor
                videos={[video]}
                height={heightOrDefault}
                components={components}
                itemUpdateCallback={updateSubtitles}
                itemUpdateCondition={true}
                videoCodesPool={[]}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
