import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { ExercisePhaseApp } from './ExercisePhaseApp/ExercisePhaseApp'
import { hydrateConfig } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { hydrateLiveSyncConfig } from './ExercisePhaseApp/Components/LiveSyncConfig/LiveSyncConfigSlice'
import { presenceActions, PresenceState, TeamMember } from './ExercisePhaseApp/Components/Presence/PresenceSlice'
import { initSolutionSyncAction } from './ExercisePhaseApp/Components/Solution/SolutionSaga'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { setCurrentEditorId } from './ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const { liveSyncConfig, solution, currentEditor } = props
        const config = props.config as ConfigState

        // set initial Redux state
        store.dispatch(hydrateConfig(config))
        store.dispatch(hydrateLiveSyncConfig(liveSyncConfig))
        store.dispatch(actions.lists.setVideoEditor(solution))
        store.dispatch(setCurrentEditorId(currentEditor))

        if (config.isGroupPhase && !config.readOnly) {
            store.dispatch(initSolutionSyncAction())
            store.dispatch(
                presenceActions.setTeamMembers(
                    liveSyncConfig.teamMembers.reduce(
                        (acc: PresenceState['teamMembersById'], teamMember: TeamMember) => ({
                            ...acc,
                            [teamMember.id]: teamMember,
                        }),
                        {}
                    )
                )
            )
        }

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <ExercisePhaseApp type={config.type} readOnly={config.readOnly} />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
