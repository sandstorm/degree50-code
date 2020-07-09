import React, {useState, useCallback} from 'react';
import Player from './Player';
import Tool from './Tool';
import Subtitle from './Subtitle'
import {useAppSelector} from "../../../../Store/Store";
import {selectConfig} from "../../../Config/ConfigSlice";

const tabs = {
    ANNOTATIONS: 'annotations',
    VIDEO_CODES: 'videoCodes',
}

export default function(props) {

    const [activeTab, setActiveTab] = useState(tabs.ANNOTATIONS);

    const updateActiveTab = useCallback(
        value => {
            console.log('set', value)
            setActiveTab(value);
        },
        [setActiveTab],
    );

    console.log(props)
    let activeTabComponent = <Subtitle {...props} />;
    if (activeTab === tabs.VIDEO_CODES) {
        activeTabComponent = <div>video codes</div>
    }

    const config = useAppSelector(selectConfig);

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
                            <a className={(activeTab === tabs.ANNOTATIONS) ? 'active' : ''} role="tab" onClick={() => updateActiveTab(tabs.ANNOTATIONS)}>Annotations</a>
                        </li>
                        <li role="presentation">
                            <a className={(activeTab === tabs.VIDEO_CODES) ? 'active' : ''} role="tab" onClick={() => updateActiveTab(tabs.VIDEO_CODES)}>VideoCodes</a>
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
