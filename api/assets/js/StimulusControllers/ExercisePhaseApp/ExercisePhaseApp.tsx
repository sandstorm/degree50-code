import React from 'react';
import Modal from "./Components/Modal/Modal";
import Toolbar from "./Components/Toolbar/Toolbar";
import {Config, setConfig} from "./Components/Config/ConfigSlice";
import {useDispatch} from "react-redux";
import VideoAnalysis from "./Domain/ExercisePhases/VideoAnalysis";
import {ExercisePhaseTypesEnum} from "./Store/ExercisePhaseTypesEnum";

type LiveSyncConfig = {
    mercureEndpoint: string
    topic: string
    exercisePhaseLiveSyncSubmitUrl: string
}

type Props = {
    solution: any
    config: Config
    liveSyncConfig: LiveSyncConfig
}

export const ExercisePhaseApp: React.FC<Props> = ({...props}) => {
    const dispatch = useDispatch()
    // set initial config to the store
    dispatch(setConfig(props.config))

    // TODO: I am quite sure the SSE channel should not be created directly
    //       in the react component, as it is a side-effect.
    //       So this needs to be moved to the proper place
    const mercureUrl = new URL(props.liveSyncConfig.mercureEndpoint, document.location);
    mercureUrl.searchParams.append('topic', props.liveSyncConfig.topic);
    const eventSource = new EventSource(mercureUrl.toString());
    eventSource.onmessage = (event) => {
        console.log("ES EVENT", event);
    }


    const phaseTypeCssClass = 'exercise-phase--' + props.config.type

    let exercisePhase = null
    switch (props.config.type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis/>
            break;
        default:

    }

    return (
        <div className={'exercise-phase ' + phaseTypeCssClass}>
            {exercisePhase}
            <a href={props.liveSyncConfig.exercisePhaseLiveSyncSubmitUrl} target="_blank">send SSE test message</a>
            <Toolbar/>
            <Modal/>
        </div>
    );
}
