import type { KeyboardEventHandler, ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/user-input.module.css'

function UserInput(): ReactElement {
    const { setUserMessage } = useGameContext()
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = useCallback(() => {
        const input = inputRef.current
        if (!input) {
            throw new Error('No reference to input element.')
        }

        if (input.value.length > 0) {
            setUserMessage(input.value)
            input.value = ''
        }
    }, [setUserMessage])

    const handleKey: KeyboardEventHandler = useCallback((e) => {
        if (e.shiftKey && e.key === 'Enter') {
            sendMessage()
            e.preventDefault()
        }
    }, [sendMessage])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef} onKeyPress={handleKey}></textarea>
            <button onClick={sendMessage}>
                <FaPlay />
            </button>
        </div>
    )
}

export default UserInput
