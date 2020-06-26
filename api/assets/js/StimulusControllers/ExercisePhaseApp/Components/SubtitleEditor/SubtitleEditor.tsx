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

setTranslations(i18n);
NProgress.configure({ minimum: 0, showSpinner: false });
serviceWorker.unregister();

export default class SubtitleEditor extends React.Component {
    render() {
        return (
            <App />
        )
    }
}
