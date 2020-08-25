import React, { useCallback, useState } from 'react'

type Probs = {
    currentMemo: string
    submitMemo: (memo: string) => void
}
export function MemoModal({ currentMemo, submitMemo }: Probs) {
    const [memo, setMemo] = useState(currentMemo)

    const handleUpdateMemo = useCallback(
        (event) => {
            setMemo(event.target.value)
        },
        [setMemo]
    )

    const handleSubmitMemo = (event: React.SyntheticEvent) => {
        event.preventDefault()
        submitMemo(memo)
    }

    return (
        <form onSubmit={handleSubmitMemo}>
            <div className={'form-group'}>
                <label>Memo</label>
                <textarea className={'form-control'} onChange={handleUpdateMemo} value={memo} />
            </div>
            <button type={'submit'} className={'btn btn-primary'}>
                Memo speichern
            </button>
        </form>
    )
}

export default React.memo(MemoModal)
