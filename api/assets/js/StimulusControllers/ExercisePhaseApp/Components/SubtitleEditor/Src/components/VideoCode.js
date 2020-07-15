import React from 'react';
import {useAppSelector} from "../../../../Store/Store";
import {selectConfig} from "../../../Config/ConfigSlice";

export default function(props) {
    const config = useAppSelector(selectConfig)

    const addVideoCode = (videoCode) => {
        props.addVideoCode(props.subtitles.length, videoCode)
    }

    const videoCodes = config.videoCodes
        .map((videoCode) => (
            <div className={'video-code'} key={videoCode.id} title={videoCode.description} style={{backgroundColor: videoCode.color}}>
                <button type='button' className={'btn btn-outline-dark'} onClick={() => {addVideoCode(videoCode)}}><i className={'fas fa-plus'}></i></button>
                <span>{videoCode.name}</span>
            </div>
        ))

    return (
        <div className="subtitle-editor__video-codes">
            {videoCodes}
        </div>
    );
}
