import React from 'react';
import ArtplayerComponent from 'artplayer-react';
import Hls from 'hls.js'

export default React.memo(
    function({ options, setPlayer, setCurrentTime }) {
        return (
            <div className="subtitle-editor-player">
                <ArtplayerComponent
                    style={{
                        width: '100%',
                        height: '200px',
                    }}
                    option={{
                        url: options.videoUrl,
                        customType: {
                            m3u8: function(video, url) {
                                var hls = new Hls();
                                hls.loadSource(url);
                                hls.attachMedia(video);
                                if (!video.src) {
                                    video.src = url;
                                }
                            },
                        },
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
