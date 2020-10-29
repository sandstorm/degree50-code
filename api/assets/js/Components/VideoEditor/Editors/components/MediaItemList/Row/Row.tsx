import React from 'react'
import { connect } from 'react-redux'
import { MediaItem } from '../../types'
import TextField from './TextField'
import Start from './Start'
import End from './End'
import Actions from './Actions'

import { actions } from '../../../../PlayerSlice'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'

type OwnProps = {
    key: string
    id: string
    index: number
    currentIndex: number
    checkMediaItem: (item: MediaItem<MediaItemType>) => boolean
    rowData: MediaItem<MediaItemType>
    removeMediaItem: (item: MediaItem<MediaItemType>) => void
    addMediaItem?: (index: number, item?: MediaItem<MediaItemType>) => void
    updateMediaItem: (item: MediaItem<MediaItemType>, updatedValues: Record<string, unknown>) => void
    moveItemUp?: () => void
    moveItemDown?: () => void
}

const mapDispatchToProps = {
    setPause: actions.setPause,
    setPlayPosition: actions.setPlayPosition,
}

type Props = typeof mapDispatchToProps & OwnProps

const Row = ({
    id,
    index,
    currentIndex,
    checkMediaItem,
    rowData,
    removeMediaItem,
    addMediaItem,
    updateMediaItem,
    setPause,
    setPlayPosition,
    moveItemUp,
    moveItemDown,
}: Props) => {
    return (
        <li
            key={id}
            className={[
                'video-editor__media-item-list__row',
                index % 2 ? 'video-editor__media-item-list__row--odd' : '',
                currentIndex === index ? 'video-editor__media-item-list__row--highlight' : '',
                checkMediaItem(rowData) ? 'video-editor__media-item-list__row--illegal' : '',
            ]
                .join(' ')
                .trim()}
            onClick={() => {
                setPause(true)
                setPlayPosition(rowData.startTime + 0.001)
            }}
        >
            <Actions
                removeMediaItem={() => removeMediaItem(rowData)}
                addMediaItem={addMediaItem ? () => addMediaItem(index) : undefined}
                moveItemUp={moveItemUp}
                moveItemDown={moveItemDown}
            />
            <div className="video-editor__media-item-list__column video-editor__media-item-list__column--time">
                <Start start={rowData.start} />
                <End end={rowData.end} />
            </div>
            <TextField
                text={rowData.text}
                updateText={(event) => updateMediaItem(rowData, { text: event.target.value })}
            />
        </li>
    )
}

export default connect(undefined, mapDispatchToProps)(React.memo(Row))
