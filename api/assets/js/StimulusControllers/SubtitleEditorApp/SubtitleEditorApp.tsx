import React, { useRef, useState } from 'react'
import { connect } from 'react-redux'
import { AppState } from './Store/Store'
import { TabsTypesEnum } from 'types'
import { selectors } from './SubtitlesAppSlice'
import { updateSubtitlesAction } from './SubtitlesSaga'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/utils/useDebouncedResizeObserver'
import SubtitleEditor from 'Components/SubtitleEditor'
import EditorTabs from 'Components/EditorTabs'
import { tabs } from 'Components/Tabs'

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

    const components = [TabsTypesEnum.VIDEO_SUBTITLES]
    const availableTabs = Object.values(tabs).filter((tab) => {
        return components.includes(tab.id)
    })

    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(
        availableTabs[0].id || TabsTypesEnum.VIDEO_ANNOTATIONS
    )

    if (!video) {
        return null
    }

    return (
        <div className="js-video-editor-container" ref={ref}>
            <SubtitleEditor
                height={heightOrDefault}
                videos={[video]}
                headerContent={
                    <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                }
                itemUpdateCallback={updateSubtitles}
                itemUpdateCondition={true}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditorApp))
