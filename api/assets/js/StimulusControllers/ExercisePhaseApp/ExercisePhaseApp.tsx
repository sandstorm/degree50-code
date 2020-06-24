import React from 'react';
import Modal from "./Components/Modal/Modal";
import Toolbar from "./Components/Toolbar/Toolbar";
import {Config, setConfig} from "./Components/Config/ConfigSlice";
import { useDispatch } from "react-redux";
import VideoAnalysis from "./Domain/ExercisePhases/VideoAnalysis";
import {ExercisePhaseTypesEnum} from "./Store/ExercisePhaseTypesEnum";
import Overlay from "./Components/Overlay/Overlay";

type Props = {
    solution: any
    config: Config
}

export const ExercisePhaseApp: React.FC<Props> = ({...props}) => {
    const dispatch = useDispatch()
    // set initial config to the store
    dispatch(setConfig(props.config))

    const phaseTypeCssClass = 'exercise-phase--' + props.config.type

    let exercisePhase = null
    switch(props.config.type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis />
            break;
        default:

    }

    return (
        <div className={'exercise-phase ' + phaseTypeCssClass}>
            <div className={'exercise-phase__main'}>
                {exercisePhase}
            </div>
            <Overlay />
            <Toolbar />
            <Modal />
        </div>
    );
}