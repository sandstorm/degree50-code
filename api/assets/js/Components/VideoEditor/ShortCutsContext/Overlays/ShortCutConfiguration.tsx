import React, { ChangeEvent, FocusEventHandler, memo } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import {
    allShortCutModifiers,
    selectShortCutConfigurationById,
    ShortCutId,
    ShortCutModifierId,
    toggleModifierForShortCut,
    setKeyForShortCut,
} from '../ShortCutsSlice'
import { persistShortCuts } from '../ShortCutsSaga'

const modifierToLabelMap: Record<ShortCutModifierId, string> = {
    [ShortCutModifierId.CTRL]: 'Control',
    [ShortCutModifierId.ALT]: 'Alt',
    [ShortCutModifierId.OPTION]: 'Option',
    [ShortCutModifierId.SHIFT]: 'Shift',
}

const shortCutIdToLabelMap: Record<ShortCutId, string> = {
    [ShortCutId.TOGGLE_PLAY]: 'VideoPlayer play/pause',
}

type OwnProps = {
    shortCutId: ShortCutId
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
    shortCutConfiguration: selectShortCutConfigurationById(state, ownProps.shortCutId),
})

const mapDispatchToProps = {
    toggleModifierForShortCut,
    setKeyForShortCut,
    persistShortCuts,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ShortCutConfiguration = (props: Props) => {
    const handleKeyFocus: FocusEventHandler<HTMLInputElement> = (ev) => {
        ev.target.select()
    }

    const handleKeyInput = (ev: ChangeEvent<HTMLInputElement>) => {
        const newKey = ev.target.value

        // prevent empty value
        if (newKey !== '') {
            props.setKeyForShortCut({ shortCutId: props.shortCutId, key: newKey })
            props.persistShortCuts()
        }

        // WHY: Hack: Pressing `delete` or `carriage return` somehow prevents the browser from selecting the input value again.
        setTimeout(() => {
            ev.target.select()
        }, 0)
    }

    return (
        <div className="short-cut-configuration">
            <p>{shortCutIdToLabelMap[props.shortCutId]}</p>
            <div className="short-cut-configuration--modifier-list">
                {allShortCutModifiers.map((modifierId) => {
                    const id = `shortCut-${props.shortCutId}-modifier--${modifierId}`

                    const enabled = props.shortCutConfiguration.modifiers[modifierId].enabled
                    const handleChange = () => {
                        // TODO: prevent if it's the last enabled modifier
                        props.toggleModifierForShortCut({ shortCutId: props.shortCutId, modifierId: modifierId })
                        props.persistShortCuts()
                    }

                    return (
                        <div key={id} className="short-cut-configuration--modifier highlight-focus-within">
                            <input id={id} type="checkbox" checked={enabled} onChange={handleChange} />
                            <label htmlFor={id}>{modifierToLabelMap[modifierId]}</label>
                        </div>
                    )
                })}
            </div>
            <input
                type="text"
                maxLength={1}
                value={props.shortCutConfiguration.key}
                onInput={handleKeyInput}
                onFocus={handleKeyFocus}
                className="short-cut-configuration-key"
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ShortCutConfiguration))
