const en = {
    open: 'Open',
    save: 'Save',
    undo: 'Undo',
    clear: 'Clear',
    help: 'Help',
    donate: 'Donate',
    confirm: 'Confirm',
    delete: 'Delete',
    insert: 'Insert Next',
    merge: 'Merge Next',

    'open-subtitle': 'Open Subtitle',
    'open-subtitle-supports': 'Supports opening .vtt, .srt and .ass subtitle',
    'open-subtitle-success': 'Open subtitles successfully',
    'open-subtitle-error': 'Failed to open subtitles',

    'open-video': 'Open Video',
    'open-video-supports': 'Supports opening .mp4, .webm and .ogg video',
    'open-video-warning':
        'The files are opened locally and no data is uploaded. When creating an audio waveform, The browser may be blocked for a short time due to audio decoding',
    'open-video-success': 'Open video successfully',
    'open-video-error': 'Failed to open video',

    'clear-warning': 'This step cannot be rolled back. Are you sure ?',
    'clear-success': 'Clear all subtitles data successfully',

    'help-info':
        'This editor is suitable for video with small volume and simple subtitle effect. For large file videos or more subtitle effect, please use professional desktop software.',
    'help-issue': 'You can ask any questions on Github Issue:',
    'help-email': 'Or contact me via email:',

    'history-rollback': 'History rollback successful',
    'history-empty': 'History is empty',

    'translation-success': 'Translation successful',
    'translation-progress': 'Translation in progress',
    'translation-limit': 'Limit 1000 translations per batch',

    'audio-waveform': 'Audio Waveform:',
    'file-size': 'File Size:',
    'decoding-progress': 'Decoding Progress:',
    'render-channel': 'Render Channel:',
    zoom: 'Zoom',
    'height-zoom': 'Height Zoom:',
    'space-metronome': 'Space Metronome:',
    'export-image': 'Export Image',
    'parameter-error': 'Parameter error',
    'keep-one': 'Please keep at least one subtitle',
    'subtitle-text': '[Subtitle Text]',
    'time-offset': 'Time Offset:',
    'google-translate': 'Google Translate:',
}

export default {
    en,
}

export const names = {
    en: 'EN',
}

export const getName = (key: string) => {
    return (
        // @ts-ignore disable-line
        {
            en: 'en',
        }[key] || 'en'
    )
}
