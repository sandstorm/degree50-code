import React from 'react';
import {connect} from 'react-redux';
import VideoPlayerWrapper from "../../Components/VideoPlayer/VideoPlayerWrapper";

const mapStateToProps = (state: any) => {
    return {

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
        <VideoPlayerWrapper />
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VideoAnalysis);