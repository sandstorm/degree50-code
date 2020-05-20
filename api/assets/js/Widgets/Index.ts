import VideoPlayer from "./VideoPlayer/VideoPlayer";
import ShowExercisePhase from "./ShowExercisePhase/ShowExercisePhase";
import SubtitleEditor from "./SubtitleEditor/SubtitleEditor";
import ExercisePhaseDefinitionEditor from "./ExercisePhaseDefinitionEditor/ExercisePhaseDefinitionEditor";

export default {
    'VideoPlayer': VideoPlayer,
    'ShowExercisePhase': ShowExercisePhase,
    'SubtitleEditor': SubtitleEditor,
    'VideoAnnotator': SubtitleEditor, // currently the same, will be a slightly different component later on
    'ExercisePhaseDefinitionEditor': ExercisePhaseDefinitionEditor
};
