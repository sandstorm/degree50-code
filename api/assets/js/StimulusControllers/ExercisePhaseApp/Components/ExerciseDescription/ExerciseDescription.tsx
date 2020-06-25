import React, {useCallback} from 'react';
import {connect} from 'react-redux';
import {selectConfig} from "../Config/ConfigSlice";

const mapStateToProps = (state: any) => ({
    config: selectConfig(state)
});

const mapDispatchToProps = (dispatch: any) => ({
});

type AdditionalProps = {
    // currently none
}

type ExerciseDescriptionProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const ExerciseDescription: React.FC<ExerciseDescriptionProps> = ({...props}) => {

    return (
        <div>
            <h3>{props.config.title}</h3>
            <p>
                {props.config.description}
            </p>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ExerciseDescription);