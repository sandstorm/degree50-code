import React from 'react'
import unescape from 'lodash/unescape'
import Sub from '../subtitle/sub'

type Props = {
    key: string
    index: number
    style: Object
    currentIndex: number
    checkSubtitle: (sub: Sub) => boolean
    rowData: Sub
    player?: {
        pause: boolean
        duration: number
        seek: number
    }
    removeSubtitle: (sub: Sub) => void
    addSubtitle: (index: number, sub?: Sub) => void
    updateSubtitle: (sub: Sub, key: string, value: string) => void
    onMouseDown: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: Sub | null, key: string) => void
    onMouseMove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: Sub | null, key: string) => void
    onMouseUp: () => void
}

const SubtitleRow = ({
    key,
    index,
    style,
    currentIndex,
    checkSubtitle,
    rowData,
    player,
    removeSubtitle,
    addSubtitle,
    updateSubtitle,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: Props) => {
    return (
        <div
            key={key}
            className={[
                'subtitles__row',
                index % 2 ? 'subtitles__row--odd' : '',
                currentIndex === index ? 'subtitles__row--highlight' : '',
                checkSubtitle(rowData) ? 'subtitles__row--illegal' : '',
            ]
                .join(' ')
                .trim()}
            style={style}
            onClick={() => {
                if (player) {
                    player.pause = true

                    if (player.duration >= rowData.startTime) {
                        player.seek = rowData.startTime + 0.001
                    }
                }
            }}
        >
            <div className="subtitles__column subtitles__column--operation" style={{ width: 30 }}>
                <i className="icon-trash-empty" onClick={() => removeSubtitle(rowData)} style={{ marginBottom: 5 }}></i>
                <i className="icon-plus" onClick={() => addSubtitle(index + 1)}></i>
            </div>
            <div className="subtitles__column subtitles__column--time" style={{ width: 150 }} onMouseUp={onMouseUp}>
                <div
                    className="input"
                    onMouseDown={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                        onMouseDown(event, rowData, 'start')
                    }
                    onMouseMove={(event) => onMouseMove(event, rowData, 'start')}
                    style={{ marginBottom: 10 }}
                >
                    {rowData.start}
                </div>
                <div
                    className="input"
                    onMouseDown={(event) => onMouseDown(event, rowData, 'end')}
                    onMouseMove={(event) => onMouseMove(event, rowData, 'end')}
                >
                    {rowData.end}
                </div>
            </div>
            <div className="subtitles__column subtitles__column--duration">{rowData.duration}</div>
            <div className="subtitles__column subtitles__column--text">
                <textarea
                    maxLength={200}
                    spellCheck={false}
                    className="textarea"
                    value={unescape(rowData.text)}
                    onChange={(event) => updateSubtitle(rowData, 'text', event.target.value)}
                />
            </div>
        </div>
    )
}

export default React.memo(SubtitleRow)
