import React from 'react';
import {connect} from 'react-redux';
import {selectIsVisible, selectTitle, selectContent, toggleVisibility} from "./ModalSlice";

const mapStateToProps = (state: any) => ({
    isVisible: selectIsVisible(state),
    title: selectTitle(state),
    content: selectContent(state),
});

const mapDispatchToProps = (dispatch: any) => ({
    toggleVisibility: () => dispatch(toggleVisibility()),
});

type AdditionalProps = {
    // currently none
}

type ModalProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Modal: React.FC<ModalProps> = ({title, content, isVisible, toggleVisibility}) => {
    return (
        <div className={(isVisible === true) ? 'modal modal--is-visible' : 'modal'} aria-label={title}>
            <div className={'modal__inner'}>
                <header className={'modal__header'}>
                    <h3>{title}</h3>
                </header>
                <div className={'modal__content-wrapper'}>
                    <div className={'modal__content'}>
                        {content}
                    </div>
                </div>
                <footer className={'modal__footer'}>
                    <button className={'btn btn-primary'} type='button' onClick={toggleVisibility}>Close</button>
                </footer>
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Modal);