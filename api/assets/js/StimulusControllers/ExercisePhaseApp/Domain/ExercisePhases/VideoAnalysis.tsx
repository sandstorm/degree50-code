import React from 'react';
import {connect} from 'react-redux';
import SubtitleEditor from "../../Components/SubtitleEditor/SubtitleEditor";
import {selectConfig} from "../../Components/Config/ConfigSlice";
import {selectSolution} from "../../Components/Solution/SolutionSlice";

const mapStateToProps = (state: any) => {
    return {
        videos: selectConfig(state).videos,
        annotations: selectSolution(state).annotations
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {

    };
};

type AdditionalProps = {
    // currently none
}

type VideoAnalysisProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({...props}) => {
    return (
        <SubtitleEditor videos={props.videos} subtitles={props.annotations} />
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VideoAnalysis);