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
import { TabTypes } from '../../../types'
import { tabs } from './Tabs'
import EditorTabs from './EditorTabs'
import SubtitleEditor from './Editors/SubtitleEditor/SubtitleEditor'
import CodeEditor from './Editors/VideoCodeEditor/VideoCodeEditor'

setTranslations(i18n)
NProgress.configure({ minimum: 0, showSpinner: false })

type Props = {
    videos: Array<Video>
}

const VideoEditor: React.FC<Props> = (props) => {
    const [height, setHeight] = useState(0)
    const [activeTabId, setActiveTabId] = useState<TabTypes>(TabTypes.ANNOTATIONS)

    useEffect(() => {
        // FIXME
        // we should use a ref here
        setHeight(document.getElementsByClassName('exercise-phase__inner')[0].clientHeight)
    })

    switch (activeTabId) {
        case TabTypes.ANNOTATIONS: {
            return (
                <SubtitleEditor
                    height={height}
                    videos={props.videos}
                    headerContent={<EditorTabs tabs={tabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />}
                />
            )
        }

        case TabTypes.VIDEO_CODES: {
            return (
                <CodeEditor
                    height={height}
                    videos={props.videos}
                    headerContent={<EditorTabs tabs={tabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />}
                />
            )
        }

        default: {
            // Technically this should not happen ;)
            return <EditorTabs tabs={tabs} activeTabId={activeTabId} setActiveTabId={setActiveTabId} />
        }
    }
}

export default VideoEditor
