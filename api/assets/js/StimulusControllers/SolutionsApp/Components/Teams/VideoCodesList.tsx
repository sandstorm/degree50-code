import React from 'react'
import { VideoCodeFromAPI, VideoCodePrototype } from '../../../../Components/VideoEditor/VideoListsSlice'

type Props = {
    videoCodesPool: Array<VideoCodePrototype>
    usedVideoCodes: Array<VideoCodeFromAPI>
}

const getAmountOfUsedVideoCodes = (videoCode: VideoCodePrototype, usedVideoCodes: Array<VideoCodeFromAPI>) => {
    const amountOfUsedVideoCodes = usedVideoCodes.filter(
        (item: VideoCodeFromAPI) => item.idFromPrototype === videoCode.id
    )
    return amountOfUsedVideoCodes.length
}

const getVideoCodes = (videoCodes: Array<VideoCodePrototype>, usedVideoCodes: Array<VideoCodeFromAPI>) => {
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
