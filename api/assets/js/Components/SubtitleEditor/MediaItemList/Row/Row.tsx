import React from 'react'
import { connect } from 'react-redux'
import { MediaItem, MediaItemType } from '../../../VideoEditor/types'
import TextField from '../../../VideoEditor/components/TextField'
import Start from '../../../VideoEditor/components/Start'
import End from '../../../VideoEditor/components/End'
import Actions from './Actions'

import { actions } from '../../../VideoEditor/PlayerSlice'

type OwnProps = {
    key: string
    id: string
    index: number
    currentIndex: number
    checkMediaItem: (item: MediaItem<MediaItemType>) => boolean
    rowData: MediaItem<MediaItemType>
    removeMediaItem: (item: MediaItem<MediaItemType>) => void
    addMediaItem?: (index: number, item?: MediaItem<MediaItemType>) => void
    updateMediaItem: (item: MediaItem<MediaItemType>, updatedValues: Partial<MediaItem<MediaItemType>>) => void
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
    const handleTextUpdate = (text: string) => {
        updateMediaItem(rowData, { text })
    }

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
            <TextField text={rowData.text} updateText={handleTextUpdate} />
        </li>
    )
}

export default connect(undefined, mapDispatchToProps)(React.memo(Row))
