import React, { Component } from 'react'
import PlayerComponent, { PlayerOptions } from './Player'
import Subtitle, { Props as SubtitleProps } from './Subtitle'
import VideoCode, { Props as VideoCodeProps } from './VideoCode'
import { Tabs } from './App'
import { Player } from './types'

type Props = {
    activeTab: string
    options: PlayerOptions
    setPlayer: (player: Player) => void
    height: number
    setCurrentTime: (time: number) => void
    updateActiveTab: (value: string) => void
} & SubtitleProps &
    VideoCodeProps

type State = {
    height: number
}

export default class Main extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            height: 200,
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
            <div className="subtitle-editor__main" style={{ height: this.props.height - 200 }}>
                <div className="subtitle-editor__section subtitle-editor__left">
                    <PlayerComponent
                        options={this.props.options}
                        setPlayer={this.props.setPlayer}
                        setCurrentTime={this.props.setCurrentTime}
                        height={this.state.height}
                    />
                    {/*<Tool {...this.props} />*/}
                </div>
                <div className="subtitle-editor__section subtitle-editor__right">
                    <header className="subtitle-editor__section-header">
                        <ul className="subtitle-editor__tabs" role="tablist">
                            <li role="presentation">
                                <a
                                    className={this.props.activeTab === Tabs.ANNOTATIONS ? 'active' : ''}
                                    role="tab"
                                    onClick={() => this.props.updateActiveTab(Tabs.ANNOTATIONS)}
                                >
                                    Annotations
                                </a>
                            </li>
                            <li role="presentation">
                                <a
                                    className={this.props.activeTab === Tabs.VIDEO_CODES ? 'active' : ''}
                                    role="tab"
                                    onClick={() => this.props.updateActiveTab(Tabs.VIDEO_CODES)}
                                >
                                    VideoCodes
                                </a>
                            </li>
                        </ul>
                    </header>
                    <div className="subtitle-editor__section-content">{activeTabComponent}</div>
                </div>
            </div>
        )
    }
}
