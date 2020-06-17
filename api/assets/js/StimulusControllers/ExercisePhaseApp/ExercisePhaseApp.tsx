import React from 'react';
import Modal from "./Components/Modal/Modal";
import Toolbar from "./Components/Toolbar/Toolbar";
import {Config, setConfig} from "./Components/Config/ConfigSlice";
import { useDispatch } from "react-redux";

type Props = {
    solution: any
    config: Config
}

export const ExercisePhaseApp: React.FC<Props> = ({...props}) => {
    const dispatch = useDispatch();
    // set initial config to the store
    dispatch(setConfig(props.config))

    return (
        <div className={'exercise-phase'}>
            <Toolbar />
            <Modal />
        </div>
    );
}