import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { actions, selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import { useVideoCodePrototypeEdit } from './useVideoCodePrototypeEdit'
import Overlay from '../../../components/Overlay'
import { getColorName } from 'ntc-ts'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => {
    const currentlyEditedElementId = selectors.videoEditor.overlay.currentlyEditedElementId(state)
    const currentlyEditedElementParentId = selectors.videoEditor.overlay.currentlyEditedElementParentId(state)
    const videoCodesById = selectors.data.videoCodePrototypes.selectById(state)

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
    appendPrototype: actions.data.videoCodePrototypes.append,
    updatePrototype: actions.data.videoCodePrototypes.update,
    closeOverlay: actions.videoEditor.overlay.unsetOverlay,
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
            props.updatePrototype({ transientVideoCodePrototype })
        } else {
            props.appendPrototype(transientVideoCodePrototype)
        }
        props.syncSolution()
        close()
    }

    const overlayTitle = props.videoCodePrototype ? 'Video-Code bearbeiten' : 'Video-Code erstellen'

    return (
        <Overlay closeCallback={close} title={overlayTitle}>
            <div className={'new-video-code'}>
                <input
                    value={transientVideoCodePrototype.color}
                    type={'color'}
                    className={'form-control form-control-sm'}
                    onChange={handleColorChange}
                    aria-label={`Ausgewählte Code-Farbe: ${getColorName(transientVideoCodePrototype.color).name}.`}
                    title="Wähle eine Farbe"
                />
                <input
                    type={'text'}
                    aria-label={'Name für neuen Video-Code'}
                    placeholder={'Name für neuen Video-Code'}
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
