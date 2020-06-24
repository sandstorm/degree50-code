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
                            <Translate value="audio-waveform" />
                        </div>
                        <div className="value">
                            <input
                                defaultChecked={true}
                                type="checkbox"
                                onChange={event => {
                                    if (!wf) return;
                                    wf.setOptions({
                                        wave: event.target.checked,
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="item">
                        <div className="name">
                            <Translate value="file-size" />
                        </div>
                        <div className="value" style={{ color: '#FF5722' }}>
                            {((fileSize || 0) / 1024 / 1024).toFixed(2)} M
                        </div>
                    </div>
                    <div className="item">
                        <div className="name">
                            <Translate value="decoding-progress" />
                        </div>
                        <div className="value" style={{ color: '#FF5722' }}>
                            {((decodeing || 0) * 100).toFixed(2)}%
                        </div>
                    </div>
                    <div className="item">
                        <div className="name">
                            <Translate value="render-channel" />
                        </div>
                        <div className="value">
                            <select
                                defaultValue={0}
                                onChange={event => {
                                    if (!wf) return;
                                    wf.changeChannel(Number(event.target.value || 0));
                                }}
                            >
                                {Array(channelNum)
                                    .fill()
                                    .map((_, index) => (
                                        <option key={index} value={index}>
                                            {index + 1}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
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
                    <div className="item">
                        <div className="name">
                            <Translate value="height-zoom" />
                        </div>
                        <div className="value">
                            <input
                                defaultValue="1"
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                onChange={event => {
                                    if (!wf) return;
                                    wf.setOptions({
                                        waveScale: Number(event.target.value || 1),
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="item">
                        <div className="name">
                            <Translate value="space-metronome" />
                        </div>
                        <div className="value">
                            {metronome ? (
                                <span style={{ color: '#4CAF50' }}>ON</span>
                            ) : (
                                <span style={{ color: '#FF5722' }}>OFF</span>
                            )}
                        </div>
                    </div>
                    <div className="item">
                        <div
                            style={{ cursor: 'pointer' }}
                            className="value"
                            onClick={() => {
                                if (!wf) return;
                                wf.exportImage();
                            }}
                        >
                            <Translate value="export-image" />
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
