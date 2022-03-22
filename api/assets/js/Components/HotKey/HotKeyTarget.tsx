import React, {CSSProperties, memo, useEffect, useMemo, useRef, useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {AnyAction} from "@reduxjs/toolkit";
import {actions as VideoEditorActions} from "../VideoEditor/PlayerSlice";
import {useAppDispatch} from "../../StimulusControllers/ExerciseAndSolutionStore/Store";

/**
 * MacOS, Windows & Linux
 */
const enableHotKeyModeShortCut = 'ctrl+shift+option+s, ctrl+shift+alt+s'
const disableHotKeyModeShortCut = 'esc'

type ShortCutToActionMap = Record<string, AnyAction>
const defaultKeyToActionMap: ShortCutToActionMap = {
    'space': VideoEditorActions.togglePlay(),
    'p': VideoEditorActions.togglePlay(),
}

const style: CSSProperties = {
    visibility: "hidden",
}

// TODO
// use Component we can focus when the ShortCutMode is enabled. We safe a reference to the target of the KeyEvent to give back focus after shortCut
// -> could use overlay.. maybe
// -> somehow the blur() stuff doesnt work for the button
// Retrieve config from localStorage
// persist config in localStorage
// config in Redux
// update localStorage
// check if unsupported stuff is in localStorage -> so changes to shortcuts/actions can happen

const HotKeyTarget = () => {
    const [enabled, setEnabled] = useState(false)
    const [originalEventTarget, setOriginalEventTarget] = useState<EventTarget | null>(null)
    const ref = useRef<HTMLButtonElement>(null)
    const dispatch = useAppDispatch()

    // enable hotKey mode
    useHotkeys(enableHotKeyModeShortCut, (ev) => {
        setOriginalEventTarget(ev.target)
        // @ts-ignore
        ev.target.blur()

        setEnabled(true)

        ev.preventDefault()
        ev.stopPropagation()
    })

    // WHY: On some elements (like inputs) we can not press shortcuts, so we have to use the hotkey mode that set's the focus to another component
    useEffect(() => {
        if (enabled && ref.current) {
            ref.current.focus()
        } else {
            // @ts-ignore
            originalEventTarget && originalEventTarget.focus()
        }
    }, [enabled])

    // TODO: debugging
    useEffect(() => {
        if (enabled) {
            console.log('HotKeyMode enabled')
        } else {
            console.log('HotKeyMode disabled')
        }
    })

    // TODO get from Redux
    const keyToActionMap = defaultKeyToActionMap

    const shortCutListAsString = useMemo(() => [...Object.keys(keyToActionMap), disableHotKeyModeShortCut].join(', '), [keyToActionMap, enableHotKeyModeShortCut])

    useHotkeys(shortCutListAsString, (ev, hotKeysEvent) => {
        // 'esc' is just for exiting the HotKeyMode without committing an action
        if (hotKeysEvent.shortcut !== 'esc') {
            const action = keyToActionMap[hotKeysEvent.shortcut]

            if (action) {
                dispatch(action)
            }
        }

        ev.preventDefault()
        ev.stopPropagation()

        // switch HotKeyMode off
        setEnabled(false)
    }, {enabled}, [keyToActionMap, dispatch])

    return <button style={style} aria-hidden={false} aria-label="Short cut mode enabled. Press the short cut now." ref={ref} className="hotkey-target"/>
}

export default memo(HotKeyTarget)
