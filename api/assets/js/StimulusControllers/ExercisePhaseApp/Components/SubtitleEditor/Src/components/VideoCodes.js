import React, { useState } from 'react';
import Block from './Block';
import { Translate } from 'react-i18nify';

export default function(props) {
    const [render, setRender] = useState({
        padding: 5,
        duration: 10,
        gridNum: 110,
        beginTime: 0,
    });

    return (
        <div className="subtitle-editor-timeline">
            <div className="subtitle-editor-timeline__header">
                <div className="subtitle-editor-timeline__header-left">
                    <div className="item">
                        <div className="name">
                            <Translate value="unit-duration" />
                        </div>
                        <div className="value">
                            <input
                                defaultValue="10"
                                type="range"
                                min="5"
                                max="20"
                                step="1"
                                onChange={event => {
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
            <div className="subtitle-editor-timeline__body">
                <Block {...props} render={render} />
            </div>
        </div>
    );
}
