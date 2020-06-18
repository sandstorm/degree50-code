import SubtitleEditor from "./SubtitleEditor/SubtitleEditor";
import VideoPlayer from "../StimulusControllers/ExercisePhaseApp/Components/VideoPlayer/VideoPlayer";

export default {
    'VideoPlayer': VideoPlayer,
    'SubtitleEditor': SubtitleEditor,
    'VideoAnnotator': SubtitleEditor, // currently the same, will be a slightly different component later on
};
