import React, {Component} from 'react';
import {render} from 'react-dom'
import Player from './Player';
import Tool from './Tool';
import Subtitle from './Subtitle'
import VideoCode from "./VideoCode";
import {Tabs} from "./App";

export default class Main extends Component {
    constructor(props) {
        super(props)

        this.state = {
            height: 200
        }
    }

    componentDidMount() {
        const container = document.getElementsByClassName('subtitle-editor__main')[0]
        const height = container.clientHeight
        this.setState({ height })
    }

    render() {
        let activeTabComponent = <Subtitle {...this.props} />
        if (this.props.activeTab === Tabs.VIDEO_CODES) {
            activeTabComponent = <VideoCode {...this.props} />
        }
        return (
            <div className="subtitle-editor__main" style={{height: this.props.height - 200}}>
                <div className="subtitle-editor__section subtitle-editor__left">
                    <Player options={this.props.options} setPlayer={this.props.setPlayer} setCurrentTime={this.props.setCurrentTime} height={this.state.height} />
                    {/*<Tool {...this.props} />*/}
                </div>
                <div className="subtitle-editor__section subtitle-editor__right">
                    <header className="subtitle-editor__section-header">
                        <ul className="subtitle-editor__tabs" role="tablist">
                            <li role="presentation">
                                <a className={(this.props.activeTab === Tabs.ANNOTATIONS) ? 'active' : ''} role="tab"
                                   onClick={() => this.props.updateActiveTab(Tabs.ANNOTATIONS)}>Annotations</a>
                            </li>
                            <li role="presentation">
                                <a className={(this.props.activeTab === Tabs.VIDEO_CODES) ? 'active' : ''} role="tab"
                                   onClick={() => this.props.updateActiveTab(Tabs.VIDEO_CODES)}>VideoCodes</a>
                            </li>
                        </ul>
                    </header>
                    <div className="subtitle-editor__section-content">
                        {activeTabComponent}
                    </div>
                </div>
            </div>
        );
    }
}
