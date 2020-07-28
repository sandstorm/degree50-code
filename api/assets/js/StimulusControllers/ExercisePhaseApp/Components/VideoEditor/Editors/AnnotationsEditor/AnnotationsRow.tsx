import React from 'react'
import unescape from 'lodash/unescape'
import { MediaItem } from '../components/types'

type Props = {
    key: string
    id: string
    index: number
    style: Object
    currentIndex: number
    checkAnnotation: (sub: MediaItem) => boolean
    rowData: MediaItem
    player?: {
        pause: boolean
        duration: number
        seek: number
    }
    removeAnnotation: (sub: MediaItem) => void
    addAnnotation: (index: number, sub?: MediaItem) => void
    updateAnnotation: (sub: MediaItem, key: string, value: string) => void
    onMouseDown: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: MediaItem | null, key: string) => void
    onMouseMove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: MediaItem | null, key: string) => void
    onMouseUp: () => void
}

const AnnotationsRow = ({
    id,
    index,
    style,
    currentIndex,
    checkAnnotation,
    rowData,
    player,
    removeAnnotation,
    addAnnotation,
    updateAnnotation,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: Props) => {
    return (
        <div
            key={id}
            className={[
                'subtitles__row',
                index % 2 ? 'subtitles__row--odd' : '',
                currentIndex === index ? 'subtitles__row--highlight' : '',
                checkAnnotation(rowData) ? 'subtitles__row--illegal' : '',
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
                <i className="icon-trash-empty" onClick={() => removeAnnotation(rowData)} style={{ marginBottom: 5 }}></i>
                <i className="icon-plus" onClick={() => addAnnotation(index + 1)}></i>
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
                    onChange={(event) => updateAnnotation(rowData, 'text', event.target.value)}
                />
            </div>
        </div>
    )
}

export default React.memo(AnnotationsRow)
