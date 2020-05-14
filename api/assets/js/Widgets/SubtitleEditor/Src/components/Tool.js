import React from 'react';
import { Translate } from 'react-i18nify';

export default function({ timeOffsetSubtitles }) {
    return (
        <div className="subtitle-editor-tool">
            <div className="item">
                <div className="title">
                    <Translate value="time-offset" />
                </div>
                <div className="value">
                    <button onClick={() => timeOffsetSubtitles(-0.1)}>-100ms</button>
                    <button onClick={() => timeOffsetSubtitles(0.1)}>+100ms</button>
                    <button onClick={() => timeOffsetSubtitles(-1)}>-1000ms</button>
                    <button onClick={() => timeOffsetSubtitles(1)}>+1000ms</button>
                </div>
            </div>
        </div>
    );
}
