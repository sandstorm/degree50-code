import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import { selectors } from './SubtitlesAppSlice'
import { updateSubtitlesAction } from './SubtitlesSaga'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/utils/useDebouncedResizeObserver'
import SubtitleEditor from 'Components/SubtitleEditor'

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

    return (
        <div className="js-video-editor-container" ref={ref}>
            <SubtitleEditor
                height={heightOrDefault}
                videos={[video]}
                itemUpdateCallback={updateSubtitles}
                itemUpdateCondition={true}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
