import React, {useState, useMemo, useCallback, useEffect} from 'react';
import Main from './Main';
import Footer from './Footer';
import Sub from '../subtitle/sub';
import clamp from 'lodash/clamp';
import {secondToTime, notify} from '../utils';
import {vttToUrlUseWorker} from '../subtitle';
import Storage from '../utils/storage';
import isEqual from 'lodash/isEqual';
import {ToastContainer} from 'react-toastify';
import {t, setLocale} from 'react-i18nify';

const history = [];
const storage = new Storage();
const worker = new Worker(vttToUrlUseWorker());

export const Tabs = {
    ANNOTATIONS: 'annotations',
    VIDEO_CODES: 'videoCodes',
}

export default function (props) {
    const height = props.height
    // Player instance
    const [player, setPlayer] = useState(null);

    // Language
    const defaultLang = storage.get('language') || navigator.language.toLowerCase() || 'en';
    const [language, setLanguage] = useState(defaultLang);

    // Subtitle currently playing index
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Subtitle currently playing time
    const [currentTime, setCurrentTime] = useState(0);

    const [activeTab, setActiveTab] = useState(Tabs.ANNOTATIONS);

    // All subtitles
    if (props.subtitles.length === 0) {
        props.subtitles = [new Sub('00:00:00.000', '00:00:01.000', t('Kommentar'))]
    }
    let subtitles = []

    if (activeTab === Tabs.ANNOTATIONS) {
        subtitles = props.subtitles.map(item => new Sub(item.start, item.end, item.text))
    } else if (activeTab === Tabs.VIDEO_CODES) {
        subtitles = props.videoCodes.map(item => new Sub(item.start, item.end, item.text, item.color))
    }

    // All options
    const firstVideoUrl = (props.videos[0]) ? props.videos[0].url : ''
    const [options, setOptions] = useState({
        videoUrl: firstVideoUrl,
        subtitleUrl: '/sample.vtt',
        uploadDialog: false,
        translationLanguage: 'en',
    });

    // Update language
    const updateLang = useCallback(
        value => {
            setLocale(value);
            setLanguage(value);
            storage.set('language', value);
        },
        [setLanguage],
    );

    // Update an option
    const setOption = useCallback(
        option => {
            setOptions({
                ...options,
                ...option,
            });
        },
        [options, setOptions],
    );

    // Only way to update all subtitles

    const updateSubtitles = (subs, saveToHistory = true) => {
        if (subs.length && !isEqual(subs, subtitles)) {
            if (activeTab === Tabs.ANNOTATIONS) {
                props.updateSubtitles(subs);
                // Convert subtitles to vtt url
                worker.postMessage(subs);
            }

            if (activeTab === Tabs.VIDEO_CODES) {
                props.updateVideoCodes(subs);
            }

            // Save 100 subtitles to history
            if (saveToHistory) {
                if (history.length >= 100) {
                    history.shift();
                }
                history.push(subs.map(sub => sub.clone));
            }

            // Save to storage
            //storage.set('subtitles', subs);
        }
    }

    // Initialize subtitles from url or storage
    // const initSubtitles = useCallback(async () => {
    //     const stateSubs = props.subtitles;
    //     const storageSubs = storage.get('subtitles');
    //     if (stateSubs) {
    //         updateSubtitles(stateSubs.map(item => new Sub(item.start, item.end, item.text)));
    //     } else if (storageSubs && storageSubs.length) {
    //         updateSubtitles(storageSubs.map(item => new Sub(item.start, item.end, item.text)));
    //     } else {
    //         const subs = await getSubFromVttUrl(options.subtitleUrl);
    //         updateSubtitles(subs);
    //     }
    // }, [options.subtitleUrl, updateSubtitles]);

    // Run only once
    useEffect(() => {
        updateLang(language);
        setCurrentIndex(subtitles.findIndex(item => item.startTime <= currentTime && item.endTime > currentTime))
        if (player && !worker.onmessage) {
            worker.onmessage = event => {
                player.subtitle.switch(event.data);
            };
        }
        worker.postMessage(props.subtitles.map(item => new Sub(item.start, item.end, item.text)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player]);

    // Update current index from current time
    useMemo(() => {
        setCurrentIndex(subtitles.findIndex(item => item.startTime <= currentTime && item.endTime > currentTime));
    }, [currentTime, setCurrentIndex]);

    // Detect if the subtitle exists
    const hasSubtitle = useCallback(sub => subtitles.indexOf(sub), [subtitles]);

    // Copy all subtitles
    const copySubtitles = useCallback(() => subtitles.map(sub => sub.clone), [subtitles]);

    // Check if subtitle is legal
    const checkSubtitle = useCallback(
        sub => {
            const index = hasSubtitle(sub);
            if (index < 0) return;
            const previous = subtitles[index - 1];
            return (previous && sub.startTime < previous.endTime) || !sub.check;
        },
        [hasSubtitle, subtitles],
    );

    // Update a single subtitle
    const updateSubtitle = useCallback(
        (sub, key, value) => {
            const index = hasSubtitle(sub);
            if (index < 0) return;
            const subs = copySubtitles();
            const {clone} = sub;
            if (typeof key === 'object') {
                Object.assign(clone, key);
            } else {
                clone[key] = value;
            }
            if (clone.check) {
                subs[index] = clone;
                updateSubtitles(subs);
            } else {
                notify(t('parameter-error'), 'error');
            }
        },
        [hasSubtitle, copySubtitles, updateSubtitles],
    );

    // Delete a subtitle
    const removeSubtitle = useCallback(
        sub => {
            const index = hasSubtitle(sub);
            if (index < 0) return;
            const subs = copySubtitles();
            if (subs.length === 1) {
                return notify(t('keep-one'), 'error');
            }
            subs.splice(index, 1);
            updateSubtitles(subs);
        },
        [hasSubtitle, copySubtitles, updateSubtitles],
    );

    // Add a subtitle
    const addSubtitle = useCallback(
        (index, sub) => {
            const subs = copySubtitles();
            if (sub) {
                subs.splice(index, 0, sub);
            } else {
                const previous = subs[index - 1];
                const start = previous ? secondToTime(previous.endTime + 0.1) : '00:00:00.001';
                const end = previous ? secondToTime(previous.endTime + 1.1) : '00:00:01.001';
                const sub = new Sub(start, end, t('subtitle-text'));
                subs.splice(index, 0, sub);
            }
            updateSubtitles(subs);
        },
        [copySubtitles, updateSubtitles],
    );

    const addVideoCode = useCallback(
        (index, videoCode) => {
            const subs = copySubtitles();
            const previous = subs[index - 1];
            const start = previous ? secondToTime(previous.endTime + 0.1) : '00:00:00.001';
            const end = previous ? secondToTime(previous.endTime + 1.1) : '00:00:01.001';
            const sub = new Sub(start, end, videoCode.name, videoCode.color);
            subs.splice(index, 0, sub);
            updateSubtitles(subs);
        },
        [copySubtitles, updateSubtitles],
    );

    // Merge two subtitles
    const mergeSubtitle = useCallback(
        sub => {
            const index = hasSubtitle(sub);
            if (index < 0) return;
            const subs = copySubtitles();
            const next = subs[index + 1];
            if (!hasSubtitle(next)) return;
            const merge = new Sub(sub.start, next.end, sub.text + '\n' + next.text);
            subs[index] = merge;
            subs.splice(index + 1, 1);
            updateSubtitles(subs);
        },
        [hasSubtitle, copySubtitles, updateSubtitles],
    );

    // Remove all subtitles
    const removeSubtitles = useCallback(() => {
        updateSubtitles([new Sub('00:00:00.000', '00:00:01.000', t('subtitle-text'))]);
    }, [updateSubtitles]);

    // Undo subtitles
    const undoSubtitles = useCallback(() => {
        if (history.length > 1) {
            history.pop();
            const subs = history[history.length - 1];
            updateSubtitles(subs, false);
            notify(t('history-rollback'));
        } else {
            notify(t('history-empty'), 'error');
        }
    }, [updateSubtitles]);

    // Subtitle time offset
    const timeOffsetSubtitles = useCallback(
        time => {
            const subs = copySubtitles();
            updateSubtitles(
                subs.map(item => {
                    item.start = secondToTime(clamp(item.startTime + time, 0, Infinity));
                    item.end = secondToTime(clamp(item.endTime + time, 0, Infinity));
                    return item;
                }),
            );
            notify(`${t('time-offset')} ${time * 1000}ms`);
        },
        [copySubtitles, updateSubtitles],
    );

    // Clean all subtitles
    const cleanSubtitles = useCallback(() => {
        history.length = 0;
        storage.set('subtitles', []);
        removeSubtitles();
        player.seek = 0;
        notify(t('clear-success'));
    }, [player, removeSubtitles]);

    // TODO change tabs here and switch subtitles to videoCodes
    const updateActiveTab = useCallback(
        value => {
            setActiveTab(value);
        },
        [setActiveTab],
    );

    const propsForEditor = {
        player,
        options,
        language,
        subtitles,
        currentTime,
        currentIndex,
        activeTab,
        height,

        setOption,
        setPlayer,
        setCurrentTime,
        setCurrentIndex,

        updateLang,
        hasSubtitle,
        addSubtitle,
        checkSubtitle,
        undoSubtitles,
        mergeSubtitle,
        removeSubtitle,
        updateSubtitle,
        cleanSubtitles,
        updateSubtitles,
        removeSubtitles,
        timeOffsetSubtitles,
        updateActiveTab,
        addVideoCode,
    };

    return (
        <React.Fragment>
            {/*<Header {...propsForEditor} />*/}
            <Main {...propsForEditor} />
            <Footer {...propsForEditor} />
            <ToastContainer />
        </React.Fragment>
    );
}
