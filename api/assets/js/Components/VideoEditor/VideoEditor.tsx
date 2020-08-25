import React, { useState, useEffect } from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import { setTranslations } from 'react-i18nify'
// @ts-ignore
import i18n from './Editors/i18n'
import 'normalize.css'
import 'nprogress/nprogress.css'
import 'react-virtualized/styles.css'
import 'react-toastify/dist/ReactToastify.css'

import './Editors/fontello/css/fontello.css'
import { tabs } from './Tabs'
import EditorTabs from './EditorTabs'
import AnnotationsEditor from './Editors/AnnotationsEditor/AnnotationsEditor'
import CodeEditor from './Editors/VideoCodeEditor/VideoCodeEditor'
import CuttingEditor from './Editors/CuttingEditor/CuttingEditor'
import { Video } from 'StimulusControllers/ExercisePhaseApp/Components/VideoPlayer/VideoPlayerWrapper'
import { TabsTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ComponentTypesEnum'
import { VideoCodePrototype } from './Editors/VideoCodeEditor/types'

setTranslations(i18n)
NProgress.configure({ minimum: 0, showSpinner: false })

type Props = {
    videos: Array<Video>
    components: Array<TabsTypesEnum>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
    videoCodesPool: VideoCodePrototype[]
}

const VideoEditor: React.FC<Props> = ({
    components,
    videos,
    itemUpdateCallback,
    itemUpdateCondition,
    videoCodesPool,
}) => {
    const [height, setHeight] = useState(0)

    const availableTabs = Object.values(tabs).filter((tab) => {
        return components.includes(tab.id)
    })

    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(
        availableTabs[0].id || TabsTypesEnum.VIDEO_ANNOTATIONS
    )

    useEffect(() => {
        setHeight(document.getElementsByClassName('exercise-phase__inner')[0].clientHeight)
    })

    switch (activeTabId) {
        case TabsTypesEnum.VIDEO_ANNOTATIONS: {
            return (
                <AnnotationsEditor
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

        default: {
            // Technically this should not happen ;)
            return <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
        }
    }
}

export default VideoEditor
