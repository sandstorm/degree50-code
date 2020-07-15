import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { ExercisePhaseApp } from './ExercisePhaseApp/ExercisePhaseApp'
import { hydrateConfig } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { setSolution } from './ExercisePhaseApp/Components/Solution/SolutionSlice'
import { hydrateLiveSyncConfig } from './ExercisePhaseApp/Components/LiveSyncConfig/LiveSyncConfigSlice'
import { initPresenceAction } from './ExercisePhaseApp/Components/Presence/PresenceSaga'
import { presenceActions, PresenceState, TeamMember } from './ExercisePhaseApp/Components/Presence/PresenceSlice'
import { initSolutionSyncAction } from './ExercisePhaseApp/Components/Solution/SolutionSaga'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const { config, liveSyncConfig, solution } = props

        // set initial Redux state
        store.dispatch(hydrateConfig(config))
        store.dispatch(hydrateLiveSyncConfig(liveSyncConfig))
        store.dispatch(setSolution(solution))

        // TODO only in TeamPhase
        store.dispatch(initSolutionSyncAction())
        store.dispatch(initPresenceAction())
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

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <ExercisePhaseApp type={config.type} />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
