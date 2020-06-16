import React from 'react';
import {Counter} from "./Components/Counter/Counter";

export function ExercisePhaseApp(props: any) {
    console.log (props);
    return (
        <div>
            <Counter />
            Hier kommt React
        </div>
    );
}