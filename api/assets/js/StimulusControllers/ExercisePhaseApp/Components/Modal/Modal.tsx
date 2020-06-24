import React from 'react';
import {connect} from 'react-redux';
import {selectIsVisible, selectTitle, selectContent, toggleModalVisibility} from "./ModalSlice";

const mapStateToProps = (state: any) => ({
    isVisible: selectIsVisible(state),
    title: selectTitle(state),
    content: selectContent(state),
});

const mapDispatchToProps = (dispatch: any) => ({
    toggleModalVisibility: () => dispatch(toggleModalVisibility()),
});

type AdditionalProps = {
    // currently none
}

type ModalProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Modal: React.FC<ModalProps> = ({...props}) => {
    return (
        <div className={(props.isVisible === true) ? 'modal modal--is-visible' : 'modal'} aria-label={props.title}>
            <div className={'modal__inner'}>
                <header className={'modal__header'}>
                    <h3>{props.title}</h3>
                </header>
                <div className={'modal__content-wrapper'}>
                    <div className={'modal__content'}>
                        {props.content}
                    </div>
                </div>
                <footer className={'modal__footer'}>
                    <button className={'btn btn-primary'} type='button' onClick={props.toggleModalVisibility}>Close</button>
                </footer>
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Modal);