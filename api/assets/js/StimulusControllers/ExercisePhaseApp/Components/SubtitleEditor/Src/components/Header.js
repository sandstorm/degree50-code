import React from 'react';
import { downloadFile } from '../utils';
import {vttToUrl, subToVtt} from '../subtitle';
import { t, Translate } from 'react-i18nify';

export default function(props) {
    return (
        <div className="subtitle-editor-header">
            <div className="subtitle-editor-header__menu-item" onClick={() => downloadFile(vttToUrl(subToVtt(props.subtitles)), `${Date.now()}.vtt`)}>
                <i className="icon-download"></i>
                <Translate value="save" />
            </div>
            <div className="subtitle-editor-header__menu-item" onClick={() => props.undoSubtitles()}>
                <i className="icon-ccw"></i>
                <Translate value="undo" />
            </div>
            <div className="subtitle-editor-header__menu-item"
                onClick={() => {
                    if (window.confirm(t('clear-warning'))) {
                        props.cleanSubtitles();
                    }
                }}
            >
                <i className="icon-trash-empty"></i>
                <Translate value="clear" />
            </div>
        </div>
    );
}
