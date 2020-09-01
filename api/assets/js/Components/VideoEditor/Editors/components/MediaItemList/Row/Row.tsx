import React from 'react'
import { connect } from 'react-redux'
import { MediaItem } from '../../types'
import TextField from './TextField'
import Duration from './Duration'
import Start from './Start'
import End from './End'
import Actions from './Actions'

import { actions } from '../../../../PlayerSlice'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'

type OwnProps = {
    key: string
    id: string
    index: number
    style: Object
    currentIndex: number
    checkMediaItem: (item: MediaItem<MediaItemType>) => boolean
    rowData: MediaItem<MediaItemType>
    removeMediaItem: (item: MediaItem<MediaItemType>) => void
    addMediaItem?: (index: number, item?: MediaItem<MediaItemType>) => void
    updateMediaItem: (item: MediaItem<MediaItemType>, updatedValues: Object) => void
}

const mapStateToProps = (state: {}) => {
    return {}
}

const mapDispatchToProps = {
    setPause: actions.setPause,
    setPlayPosition: actions.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const Row = ({
    id,
    index,
    style,
    currentIndex,
    checkMediaItem,
    rowData,
    removeMediaItem,
    addMediaItem,
    updateMediaItem,
    setPause,
    setPlayPosition,
}: Props) => {
    return (
        <div
            key={id}
            className={[
                'video-editor__media-item-list__row',
                index % 2 ? 'video-editor__media-item-list__row--odd' : '',
                currentIndex === index ? 'video-editor__media-item-list__row--highlight' : '',
                checkMediaItem(rowData) ? 'video-editor__media-item-list__row--illegal' : '',
            ]
                .join(' ')
                .trim()}
            style={style}
            onClick={() => {
                setPause(true)
                setPlayPosition(rowData.startTime + 0.001)
            }}
        >
            <Actions
                removeMediaItem={() => removeMediaItem(rowData)}
                addMediaItem={addMediaItem ? () => addMediaItem(index) : undefined}
            />
            <div
                className="video-editor__media-item-list__column video-editor__media-item-list__column--time"
                style={{ width: 150 }}
            >
                <Start start={rowData.start} />
                <End end={rowData.end} />
            </div>
            <Duration duration={rowData.duration} />
            <TextField
                text={rowData.text}
                updateText={(event) => updateMediaItem(rowData, { text: event.target.value })}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Row))
