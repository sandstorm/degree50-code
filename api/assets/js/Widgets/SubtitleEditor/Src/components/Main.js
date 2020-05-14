import React from 'react';
import Player from './Player';
import Tool from './Tool';
import Subtitle from './Subtitle';

export default function(props) {
    return (
        <div className="subtitle-editor__main">
            <div className="subtitle-editor__player">
                <Player {...props} />
                <Tool {...props} />
            </div>
            <div className="subtitle-editor__subtitles">
                <Subtitle {...props} />
            </div>
        </div>
    );
}
