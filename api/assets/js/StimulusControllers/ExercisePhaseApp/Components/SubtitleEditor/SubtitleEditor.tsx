import React from 'react';
import App from './Src/components/App';
import NProgress from 'nprogress';
import * as serviceWorker from './Src/serviceWorker';
import { setTranslations } from 'react-i18nify';
import i18n from './Src/i18n';
import 'normalize.css';
import './Src/fontello/css/fontello.css';
import 'nprogress/nprogress.css';
import 'react-virtualized/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import {Video} from "../VideoPlayer/VideoPlayerWrapper";
import {connect} from 'react-redux';

setTranslations(i18n);
NProgress.configure({ minimum: 0, showSpinner: false });
serviceWorker.unregister();

export type Subtitle = {
    start: string
    end: string
    text: string
}

const mapStateToProps = (state: any) => {
    return {

    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {

    };
};

type AdditionalProps = {
    // currently none
    videos: Array<Video>
    subtitles: Array<Subtitle>
}

type SubtitleEditorProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>


const SubtitleEditorWrapper: React.FC<SubtitleEditorProps> = ({...props}) => {
    return (
        <App {...props} />
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SubtitleEditorWrapper)