import React from 'react'
import { connect } from 'react-redux'
import { selectIsVisible, selectTitle, selectContent, selectComponent, toggleModalVisibility } from './ModalSlice'
import ExerciseDescription from '../ExerciseDescription/ExerciseDescription'
import { ComponentTypesEnum } from '../../Store/ComponentTypesEnum'
import FocusLock from 'react-focus-lock'
import { AppState, AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

const mapStateToProps = (state: AppState) => ({
    isVisible: selectIsVisible(state),
    title: selectTitle(state),
    content: selectContent(state),
    component: selectComponent(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    toggleModalVisibility: () => dispatch(toggleModalVisibility()),
})

type AdditionalProps = {
    // currently none
}

type ModalProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Modal: React.FC<ModalProps> = (props) => {
    let componentToRender = null
    switch (props.component) {
        case ComponentTypesEnum.EXERCISE_DESCRIPTION:
            componentToRender = <ExerciseDescription />
            break
        default:
    }

    return (
        <FocusLock disabled={!props.isVisible}>
            <div
                role="dialog"
                className={props.isVisible === true ? 'modal modal--is-visible' : 'modal'}
                aria-label={props.title}
            >
                <div className={'modal__inner'}>
                    <header className={'modal__header'}>
                        <h3>{props.title}</h3>
                    </header>
                    <div className={'modal__content-wrapper'}>
                        <div className={'modal__content'}>
                            {props.content}
                            {componentToRender ? componentToRender : ''}
                        </div>
                    </div>
                    <footer className={'modal__footer'}>
                        <button className={'btn btn-primary'} type="button" onClick={props.toggleModalVisibility}>
                            Close
                        </button>
                    </footer>
                </div>
            </div>
        </FocusLock>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)
