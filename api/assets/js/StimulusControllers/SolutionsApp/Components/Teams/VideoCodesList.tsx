import React from 'react'
import { VideoCodePrototype } from '../../../../Components/VideoEditor/Editors/VideoCodeEditor/types'
import { VideoCode } from '../../../../Components/VideoEditor/VideoListsSlice'

type Props = {
    videoCodesPool: Array<VideoCodePrototype>
    usedVideoCodes: Array<VideoCode>
}

const getAmountOfUsedVideoCodes = (videoCode: VideoCodePrototype, usedVideoCodes: Array<VideoCode>) => {
    const amountOfUsedVideoCodes = usedVideoCodes.filter((item: VideoCode) => item.idFromPrototype === videoCode.id)
    return amountOfUsedVideoCodes.length
}

const getVideoCodes = (videoCodes: Array<VideoCodePrototype>, usedVideoCodes: Array<VideoCode>) => {
    return (
        <ul className={'video-editor__video-codes'}>
            {videoCodes
                ? videoCodes.map((videoCode: VideoCodePrototype) => (
                      <li key={videoCode.id} className={'video-code video-code--show-children'}>
                          <div className={'video-code__content'}>
                              <div className={'video-code__color'} style={{ backgroundColor: videoCode.color || '' }} />
                              <span className={'video-code__name'}>{videoCode.name}</span>
                              {!videoCode.userCreated ? (
                                  <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
                              ) : null}
                              <span title={'Anzahl im Ergebnis'}>
                                  ({getAmountOfUsedVideoCodes(videoCode, usedVideoCodes)})
                              </span>
                          </div>
                          {videoCode.videoCodes.length > 0 ? getVideoCodes(videoCode.videoCodes, usedVideoCodes) : null}
                      </li>
                  ))
                : 'Es sind keine Video-Codes vorhanden'}
        </ul>
    )
}

const VideoCodesList = ({ videoCodesPool, usedVideoCodes }: Props) => {
    return getVideoCodes(videoCodesPool, usedVideoCodes)
}

export default React.memo(VideoCodesList)
