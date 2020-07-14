import React from 'react';
import Player from './Player';
import Tool from './Tool';
import Subtitle from './Subtitle'
import VideoCode from "./VideoCode";
import {Tabs} from "./App";

export default function(props) {
    let activeTabComponent = <Subtitle {...props} />;
    if (props.activeTab === Tabs.VIDEO_CODES) {
        activeTabComponent = <VideoCode {...props} />
    }

    return (
        <div className="subtitle-editor__main">
            <div className="subtitle-editor__section subtitle-editor__left">
                <Player {...props} />
                {/*<Tool {...props} />*/}
            </div>
            <div className="subtitle-editor__section subtitle-editor__right">
                <header className="subtitle-editor__section-header">
                    <ul className="subtitle-editor__tabs" role="tablist">
                        <li role="presentation">
                            <a className={(props.activeTab === Tabs.ANNOTATIONS) ? 'active' : ''} role="tab" onClick={() => props.updateActiveTab(Tabs.ANNOTATIONS)}>Annotations</a>
                        </li>
                        <li role="presentation">
                            <a className={(props.activeTab === Tabs.VIDEO_CODES) ? 'active' : ''} role="tab" onClick={() => props.updateActiveTab(Tabs.VIDEO_CODES)}>VideoCodes</a>
                        </li>
                    </ul>
                </header>
                <div className="subtitle-editor__section-content">
                    { activeTabComponent }
                </div>
            </div>
        </div>
    );
}
