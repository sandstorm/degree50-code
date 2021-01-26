import React, { useState } from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import { setTranslations, setLocale } from 'react-i18nify'
import i18n from './Editors/i18n'
import 'normalize.css'
import 'nprogress/nprogress.css'
import 'react-virtualized/styles.css'
import 'react-toastify/dist/ReactToastify.css'

import './Editors/fontello/css/fontello.css'
import { tabs } from './Tabs'
import EditorTabs from './EditorTabs'
import CodeEditor from './Editors/VideoCodeEditor/VideoCodeEditor'
import CuttingEditor from './Editors/CuttingEditor/CuttingEditor'
import SubtitleEditor from './Editors/SubtitleEditor/SubtitleEditor'
import { TabsTypesEnum } from 'types'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import { VideoCodePrototype } from './VideoListsSlice'

setTranslations(i18n)
setLocale('de')
NProgress.configure({ minimum: 0, showSpinner: false })

type Props = {
    videos: Array<Video>
    components: Array<TabsTypesEnum>
    height: number
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
    videoCodesPool: VideoCodePrototype[]
}

const VideoEditor: React.FC<Props> = ({
    components,
    videos,
    height,
    itemUpdateCallback,
    itemUpdateCondition,
    videoCodesPool,
}) => {
    const availableTabs = Object.values(tabs).filter((tab) => {
        return components.includes(tab.id)
    })

    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(
        availableTabs[0].id || TabsTypesEnum.VIDEO_ANNOTATIONS
    )

    switch (activeTabId) {
        case TabsTypesEnum.VIDEO_CODES: {
            return (
                <CodeEditor
                    height={height}
                    videos={videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
                    itemUpdateCallback={itemUpdateCallback}
                    itemUpdateCondition={itemUpdateCondition}
                    videoCodesPool={videoCodesPool}
                />
            )
        }

        case TabsTypesEnum.VIDEO_CUTTING: {
            return (
                <CuttingEditor
                    height={height}
                    videos={videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
                    itemUpdateCallback={itemUpdateCallback}
                    itemUpdateCondition={itemUpdateCondition}
                />
            )
        }

        case TabsTypesEnum.VIDEO_SUBTITLES: {
            return (
                <SubtitleEditor
                    height={height}
                    videos={videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
                    itemUpdateCallback={itemUpdateCallback}
                    itemUpdateCondition={itemUpdateCondition}
                />
            )
        }

        default: {
            // Technically this should not happen ;)
            return <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
        }
    }
}

export default VideoEditor
