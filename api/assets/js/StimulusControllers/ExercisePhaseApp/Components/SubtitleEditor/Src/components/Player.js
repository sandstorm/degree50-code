import React from 'react';
import ArtplayerComponent from 'artplayer-react';

export default React.memo(
    function({ options, setPlayer, setCurrentTime }) {
        console.log(options);
        return (
            <div className="subtitle-editor-player">
                <ArtplayerComponent
                    style={{
                        width: '100%',
                        height: '200px',
                    }}
                    option={{
                        url: options.videoUrl,
                        loop: true,
                        autoSize: true,
                        aspectRatio: true,
                        playbackRate: true,
                        fullscreen: true,
                        fullscreenWeb: true,
                        miniProgressBar: true,
                        subtitle: {
                            url: options.subtitleUrl,
                        },
                        moreVideoAttr: {
                            crossOrigin: 'anonymous',
                            preload: 'auto',
                        },
                    }}
                    getInstance={art => {
                        setPlayer(art);

                        (function loop() {
                            window.requestAnimationFrame(() => {
                                if (art.playing) {
                                    setCurrentTime(art.currentTime);
                                }
                                loop();
                            });
                        })();

                        art.on('seek', () => {
                            setCurrentTime(art.currentTime);
                        });
                    }}
                />
            </div>
        );
    },
    () => true,
);
