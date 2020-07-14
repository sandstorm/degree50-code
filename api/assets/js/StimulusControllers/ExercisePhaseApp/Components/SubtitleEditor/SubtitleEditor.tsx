import React from 'react'
// @ts-ignore
import App from './Src/components/App'
// @ts-ignore
import NProgress from 'nprogress'
// @ts-ignore
import * as serviceWorker from './Src/serviceWorker'
import { setTranslations } from 'react-i18nify'
// @ts-ignore
import i18n from './Src/i18n'
import 'normalize.css'
import './Src/fontello/css/fontello.css'
import 'nprogress/nprogress.css'
import 'react-virtualized/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import { Video } from '../VideoPlayer/VideoPlayerWrapper'
import { connect } from 'react-redux'
import { sendSolutionState, setAnnotations, setVideoCodes } from '../Solution/SolutionSlice'
import { useAppDispatch } from '../../Store/Store'
import { VideoCode } from '../Config/ConfigSlice'

setTranslations(i18n)
NProgress.configure({ minimum: 0, showSpinner: false })
serviceWorker.unregister()

export type Subtitle = {
    start: string
    end: string
    text: string
    color: string
}

const mapStateToProps = (state: any) => {
    return {}
}

const mapDispatchToProps = (dispatch: any) => {
    return {}
}

type AdditionalProps = {
    videos: Array<Video>
    subtitles: Array<Subtitle>
    videoCodes: Array<Subtitle>
}

type SubtitleEditorProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const SubtitleEditorWrapper: React.FC<SubtitleEditorProps> = (props) => {
    const dispatch = useAppDispatch()
    const updateSubtitles = (subtitles: Array<Subtitle>) => {
        dispatch(setAnnotations(JSON.parse(JSON.stringify(subtitles))))
        // @ts-ignore
        dispatch(sendSolutionState())
    }
    const updateVideoCodes = (videoCodes: Array<Subtitle>) => {
        dispatch(setVideoCodes(JSON.parse(JSON.stringify(videoCodes))))
        // @ts-ignore
        dispatch(sendSolutionState())
    }
    return (
        <App
            videos={props.videos}
            subtitles={props.subtitles}
            videoCodes={props.videoCodes}
            updateSubtitles={updateSubtitles}
            updateVideoCodes={updateVideoCodes}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SubtitleEditorWrapper)
