import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import { useVideoCodePrototypeEdit } from './useVideoCodePrototypeEdit'
import Overlay from '../../../components/Overlay'

const mapStateToProps = (state: VideoEditorState) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const currentlyEditedElementParentId = selectors.overlay.currentlyEditedElementParentId(state)
    const videoCodesById = selectors.data.videoCodePool.selectVideoCodesById(state)

    const videoCodePrototype = currentlyEditedElementId ? videoCodesById[currentlyEditedElementId] : undefined
    const videoCodePrototypeParent = currentlyEditedElementParentId
        ? videoCodesById[currentlyEditedElementParentId]
        : undefined

    return {
        videoCodePrototype,
        videoCodePrototypeParent,
    }
}

const mapDispatchToProps = {
    appendVideoCode: actions.data.videoCodePool.append,
    updateVideoCode: actions.data.videoCodePool.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const EditVideoCodePrototypeOverlay: FC<Props> = (props) => {
    const { transientVideoCodePrototype, handleColorChange, handleNameChange } = useVideoCodePrototypeEdit(
        props.videoCodePrototype,
        props.videoCodePrototypeParent
    )

    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.editPrototype)
    }

    const submit = () => {
        if (props.videoCodePrototype) {
            props.updateVideoCode({ transientVideoCode: transientVideoCodePrototype })
        } else {
            props.appendVideoCode(transientVideoCodePrototype)
        }
        props.syncSolution()
        close()
    }

    const canEditColor = props.videoCodePrototypeParent === undefined

    const overlayTitle = props.videoCodePrototype ? 'VideoCode bearbeiten' : 'VideoCode erstellen'

    return (
        <Overlay closeCallback={close} title={overlayTitle}>
            <div className={'new-video-code'}>
                {canEditColor ? (
                    <input
                        value={transientVideoCodePrototype.color}
                        type={'color'}
                        className={'form-control form-control-sm'}
                        onChange={handleColorChange}
                    />
                ) : (
                    <div
                        className={'video-code__color'}
                        style={{ backgroundColor: transientVideoCodePrototype.color }}
                    />
                )}
                <input
                    type={'text'}
                    placeholder={'Name für neuen Videocode'}
                    className={'form-control form-control-sm'}
                    onChange={handleNameChange}
                    value={transientVideoCodePrototype.name}
                />
                <button title={'Verwerfen'} aria-label={'Verwerfen'} className={'btn btn-grey btn-sm'} onClick={close}>
                    <i className={'fas fa-times'} />
                </button>
                <button
                    title={'Speichern'}
                    aria-label={'Speichern'}
                    className={'btn btn-primary btn-sm'}
                    onClick={submit}
                    disabled={transientVideoCodePrototype.name === ''}
                >
                    <i className={'fas fa-check'} />
                </button>
            </div>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditVideoCodePrototypeOverlay))
