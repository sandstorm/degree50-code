import React, { useEffect, useState } from 'react';
import WF from '../waveform';
import { sleep } from '../utils';
import Block from './Block';
import Metronome from './Metronome';
import { Translate } from 'react-i18nify';

let wf = null;
const Waveform = React.memo(
    ({ options, player, setDecodeing, setFileSize, setChannelNum, setRender }) => {
        const $waveform = React.createRef();

        useEffect(() => {
            if (wf) wf.destroy();

            wf = new WF({
                container: $waveform.current,
                mediaElement: player.template.$video,
                backgroundColor: 'rgb(20, 23, 38)',
                waveColor: 'rgba(255, 255, 255, 0.1)',
                progressColor: 'rgba(255, 255, 255, 0.5)',
                gridColor: 'rgba(255, 255, 255, 0.05)',
                rulerColor: 'rgba(255, 255, 255, 0.5)',
            });

            wf.on('render', setRender);
            wf.on('decodeing', setDecodeing);
            wf.on('fileSize', setFileSize);
            wf.on('audiobuffer', audiobuffer => setChannelNum(audiobuffer.numberOfChannels));
            sleep(1000).then(() => wf.load(options.videoUrl));
        }, [player, $waveform, options.videoUrl, setDecodeing, setFileSize, setChannelNum, setRender]);
        return <div className="waveform" ref={$waveform} />;
    },
    (prevProps, nextProps) => prevProps.options.videoUrl === nextProps.options.videoUrl,
);

export default function(props) {
    const [decodeing, setDecodeing] = useState(0);
    const [fileSize, setFileSize] = useState(0);
    const [channelNum, setChannelNum] = useState(1);
    const [metronome, setMetronome] = useState(false);
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
                                    if (!wf) return;
                                    wf.setOptions({
                                        duration: Number(event.target.value || 10),
                                    });
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
            <div className="subtitle-editor-timeline__body">
                {props.player ? (
                    <Waveform
                        {...props}
                        setDecodeing={setDecodeing}
                        setFileSize={setFileSize}
                        setChannelNum={setChannelNum}
                        setRender={setRender}
                    />
                ) : null}
                <Metronome {...props} render={render} metronome={metronome} setMetronome={setMetronome} />
                <Block {...props} render={render} />
            </div>
        </div>
    );
}
