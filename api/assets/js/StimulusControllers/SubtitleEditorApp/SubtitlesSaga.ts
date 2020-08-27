import { call, cancel, cancelled, debounce, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import Axios from 'axios'
import { selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import { selectors as subtitleAppSelectors } from './SubtitlesSlice'

export const updateSubtitlesAction = createAction('SubtitleApp/Saga/updateSubtitles')

export default function* subtitleEditSaga() {
    yield debounce(1000, updateSubtitlesAction.type, updateSubtitles)
}

function* updateSubtitles() {
    const lists = videoEditorSelectors.lists.selectVideoEditorLists(yield select())
    const subtitles = lists.subtitles
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
