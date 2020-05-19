import React from 'react';
import widgets from '../Index';

const ShowExercisePhase = (props: any) => {
    const mainView = props.mainView.type;
    const ReactWidget = widgets[mainView];
    return <div>
        <ReactWidget {...props} />
    </div>;

};
export default ShowExercisePhase;