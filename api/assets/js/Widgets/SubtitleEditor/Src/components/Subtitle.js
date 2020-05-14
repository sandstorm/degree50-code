import React, { useEffect, useState, useCallback } from 'react';
import { Table } from 'react-virtualized';
import debounce from 'lodash/debounce';
import unescape from 'lodash/unescape';
import clamp from 'lodash/clamp';
import { timeToSecond, secondToTime } from '../utils';

export default function({
    player,
    subtitles,
    addSubtitle,
    currentIndex,
    updateSubtitle,
    removeSubtitle,
    translateSubtitle,
    checkSubtitle,
}) {
    let isDroging = false;
    let lastPageX = 0;
    let lastSub = null;
    let lastKey = '';
    let lastValue = '';

    function onMouseDown(event, sub, key) {
        isDroging = true;
        lastPageX = event.pageX;
        lastSub = sub;
        lastKey = key;
    }

    function onMouseMove(event, sub, key) {
        if (isDroging) {
            const time = Number(((event.pageX - lastPageX) / 10).toFixed(3));
            lastValue = secondToTime(clamp(timeToSecond(sub[key]) + time, 0, Infinity));
        }
    }

    function onMouseUp() {
        if (isDroging) {
            if (lastSub && lastKey && lastValue) {
                updateSubtitle(lastSub, lastKey, lastValue);
            }
            isDroging = false;
            lastPageX = 0;
            lastSub = null;
            lastKey = '';
            lastValue = '';
        }
    }

    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);

    const resize = useCallback(() => {
        setWidth(document.body.clientWidth / 2);
        setHeight(document.body.clientHeight - 210);
    }, [setWidth, setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    return (
        <div className="subtitles">
            <Table
                className="subtitles__table"
                headerHeight={40}
                width={width}
                height={height}
                rowHeight={80}
                scrollToIndex={currentIndex}
                rowCount={subtitles.length}
                rowGetter={({ index }) => subtitles[index]}
                headerRowRenderer={() => null}
                rowRenderer={props => {
                    return (
                        <div
                            key={props.key}
                            className={[
                                'subtitles__row',
                                props.index % 2 ? 'subtitles__row--odd' : '',
                                currentIndex === props.index ? 'subtitles__row--highlight' : '',
                                checkSubtitle(props.rowData) ? 'subtitles__row--illegal' : '',
                            ]
                                .join(' ')
                                .trim()}
                            style={props.style}
                            onClick={() => {
                                player.pause = true;
                                if (player.duration >= props.rowData.startTime) {
                                    player.seek = props.rowData.startTime + 0.001;
                                }
                            }}
                        >
                            <div className="subtitles__column subtitles__column--operation" style={{ width: 30 }}>
                                <i
                                    className="icon-trash-empty"
                                    onClick={() => removeSubtitle(props.rowData)}
                                    style={{ marginBottom: 5 }}
                                ></i>
                                <i className="icon-plus" onClick={() => addSubtitle(props.index + 1)}></i>
                            </div>
                            <div className="subtitles__column subtitles__column--time" style={{ width: 150 }} onMouseUp={onMouseUp}>
                                <div
                                    className="input"
                                    onMouseDown={event => onMouseDown(event, props.rowData, 'start')}
                                    onMouseMove={event => onMouseMove(event, props.rowData, 'start')}
                                    style={{ marginBottom: 10 }}
                                >
                                    {props.rowData.start}
                                </div>
                                <div
                                    className="input"
                                    onMouseDown={event => onMouseDown(event, props.rowData, 'end')}
                                    onMouseMove={event => onMouseMove(event, props.rowData, 'end')}
                                >
                                    {props.rowData.end}
                                </div>
                            </div>
                            <div className="subtitles__column subtitles__column--duration">
                                {props.rowData.duration}
                            </div>
                            <div className="subtitles__column subtitles__column--text">
                                <textarea
                                    maxLength={200}
                                    spellCheck={false}
                                    className="textarea"
                                    value={unescape(props.rowData.text)}
                                    onChange={event => updateSubtitle(props.rowData, 'text', event.target.value)}
                                />
                            </div>
                        </div>
                    );
                }}
            ></Table>
        </div>
    );
}
