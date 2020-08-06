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

import { Video } from '../VideoPlayer/VideoPlayerWrapper'
import './Editors/fontello/css/fontello.css'
import { tabs } from './Tabs'
import EditorTabs from './EditorTabs'
import AnnotationsEditor from './Editors/AnnotationsEditor/AnnotationsEditor'
import CodeEditor from './Editors/VideoCodeEditor/VideoCodeEditor'
import CuttingEditor from './Editors/CuttingEditor/CuttingEditor'
import { TabsTypesEnum } from '../../Store/ComponentTypesEnum'

setTranslations(i18n)
NProgress.configure({ minimum: 0, showSpinner: false })

type Props = {
    videos: Array<Video>
    components: Array<TabsTypesEnum>
}

const VideoEditor: React.FC<Props> = (props) => {
    const [height, setHeight] = useState(0)
    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(TabsTypesEnum.VIDEO_ANNOTATIONS)

    const availableTabs = Object.values(tabs).filter((tab) => {
        return props.components.includes(tab.id)
    })

    useEffect(() => {
        setHeight(document.getElementsByClassName('exercise-phase__inner')[0].clientHeight)
    })

    switch (activeTabId) {
        case TabsTypesEnum.VIDEO_ANNOTATIONS: {
            return (
                <AnnotationsEditor
                    height={height}
                    videos={props.videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
                />
            )
        }

        case TabsTypesEnum.VIDEO_CODES: {
            return (
                <CodeEditor
                    height={height}
                    videos={props.videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
                />
            )
        }

        case TabsTypesEnum.VIDEO_CUTTING: {
            return (
                <CuttingEditor
                    height={height}
                    videos={props.videos}
                    headerContent={
                        <EditorTabs tabs={availableTabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
                    }
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
