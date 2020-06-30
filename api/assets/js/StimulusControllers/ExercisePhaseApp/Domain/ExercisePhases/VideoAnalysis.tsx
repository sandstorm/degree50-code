import React from 'react';
import {connect} from 'react-redux';
import VideoPlayerWrapper from "../../Components/VideoPlayer/VideoPlayerWrapper";
import SubtitleEditor from "../../Components/SubtitleEditor/SubtitleEditor";
import {selectConfig} from "../../Components/Config/ConfigSlice";

const mapStateToProps = (state: any) => {
    return {
        videos: selectConfig(state).videos,
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
        <SubtitleEditor videos={props.videos} />
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VideoAnalysis);