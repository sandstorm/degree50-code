import React from 'react';
import {connect} from 'react-redux';
import {selectIsVisible, toggleVisibility} from "./ModalSlice";

type Props = {
    title: string,
    text: string,
    isVisible: boolean,
    toggleVisibility: any
}

export function ModalInner({title, text, isVisible, toggleVisibility}: Props) {
    return (
        <div className={(isVisible === true) ? 'modal modal--is-visible' : 'modal'} aria-label={title}>
            <div className={'modal__inner'}>
                <header className={'modal__header'}>
                    <h3>{title}</h3>
                </header>
                <div className={'modal__content-wrapper'}>
                    <div className={'modal__content'}>
                        {text}
                    </div>
                </div>
                <footer className={'modal__footer'}>
                    <button className={'btn btn-primary'} type='button' onClick={toggleVisibility}>Close</button>
                </footer>
            </div>
        </div>
    );
}

const mapStateToProps = (state: any) => {
    return {
        isVisible: selectIsVisible(state),
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        toggleVisibility: () => dispatch(toggleVisibility()),
    };
};


export const Modal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalInner);