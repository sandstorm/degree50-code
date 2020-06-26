import React from 'react';
import NProgress from 'nprogress';
import { notify } from '../utils';
import { getVtt, vttToUrl, getSubFromVttUrl } from '../subtitle';
import { t, Translate } from 'react-i18nify';

export default function({ player, options, setOption, updateSubtitles }) {
    async function openSubtitle(file) {
        if (file) {
            NProgress.start().set(0.5);
            try {
                const vttText = await getVtt(file);
                if (vttText) {
                    const subtitleUrl = vttToUrl(vttText);
                    updateSubtitles(await getSubFromVttUrl(subtitleUrl));
                    player.subtitle.switch(subtitleUrl);
                    setOption({ subtitleUrl, uploadDialog: false });
                    notify(t('open-subtitle-success'));
                } else {
                    notify(t('open-subtitle-error'), 'error');
                }
            } catch (error) {
                notify(error.message, 'error');
            }
            NProgress.done();
        }
    }

    function openVideo(file) {
        if (file) {
            NProgress.start().set(0.5);
            if (typeof file === 'string') {
                player.url = file;
                setOption({ videoUrl: file, uploadDialog: false });
                notify(t('open-video-success'));
            } else {
                const $video = document.createElement('video');
                const canPlayType = $video.canPlayType(file.type);
                if (canPlayType === 'maybe' || canPlayType === 'probably') {
                    const videoUrl = URL.createObjectURL(file);
                    player.url = videoUrl;
                    setOption({ videoUrl: videoUrl, uploadDialog: false });
                    notify(t('open-video-success'));
                } else {
                    notify(t('open-video-error'), 'error');
                }
            }
            NProgress.done();
        }
    }

    return (
        <div className="subtitle-editor-upload">
            <div className="item">
                <div className="title">
                    <Translate value="open-subtitle" />
                </div>
                <div className="content">
                    <div className="upload">
                        <input
                            disabled
                            value={options.subtitleUrl}
                            type="text"
                            className="input"
                            spellCheck="false"
                            onChange={event => openSubtitle(event.target.value)}
                        />
                        <div className="file">
                            <Translate value="open" />
                            <input type="file" onChange={event => openSubtitle(event.target.files[0])} />
                        </div>
                    </div>
                    <div className="info">
                        <Translate value="open-subtitle-supports" />
                    </div>
                </div>
            </div>
            <div className="item">
                <div className="title">
                    <Translate value="open-video" />
                </div>
                <div className="content">
                    <div className="upload">
                        <input
                            disabled
                            value={options.videoUrl}
                            type="text"
                            className="input"
                            spellCheck="false"
                            onChange={event => openVideo(event.target.value)}
                        />
                        <div className="file">
                            <Translate value="open" />
                            <input type="file" onChange={event => openVideo(event.target.files[0])} />
                        </div>
                    </div>
                    <div className="info">
                        <Translate value="open-video-supports" />
                    </div>
                    <div className="warning">
                        <Translate value="open-video-warning" />
                    </div>
                </div>
            </div>
        </div>
    );
}
