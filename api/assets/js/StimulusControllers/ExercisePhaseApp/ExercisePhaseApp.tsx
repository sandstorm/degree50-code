import React from 'react';
import {Toolbar} from "./Components/Toolbar/Toolbar";
import {Modal} from "./Components/Modal/Modal";

type Props = {
    solution: any
    config: {
        title: string,
        description: string,
        components: string[],
        material: Array<object>,
        videos: Array<object>
    }
}

export function ExercisePhaseApp({solution, config}: Props) {
    return (
        <div className={'exercise-phase'}>
            <Toolbar components={config.components} />
            <Modal text={''} title={''} />
        </div>
    );
}