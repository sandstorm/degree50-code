import { debounce, select } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { selectors as subtitleSelectors } from 'Components/SubtitleEditor/SubtitlesSlice'
import { selectors as subtitleAppSelectors } from './SubtitlesAppSlice'

export const updateSubtitlesAction = createAction('SubtitleApp/Saga/updateSubtitles')

export default function* subtitleEditSaga() {
    yield debounce(1000, updateSubtitlesAction.type, updateSubtitles)
}

function* updateSubtitles() {
    const subtitles = subtitleSelectors.selectDenormalizedSubtitles(yield select())
    const video = subtitleAppSelectors.selectVideo(yield select())
    const url = subtitleAppSelectors.selectUpdateUrl(yield select())

    if (video && url) {
        try {
            yield Axios.post(url, {
                videoId: video.id,
                subtitles,
            })
        } catch (e) {
            console.warn('>>>>>> updateSubtitles', e)
        }
    }
}
