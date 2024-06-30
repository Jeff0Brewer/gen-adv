import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/user-input.module.css'

function UserInput(): ReactElement {
    const { setUserMessage } = useGameContext()
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = useCallback(() => {
        if (!inputRef.current) {
            throw new Error('No reference to input element.')
        }
        const content = inputRef.current.value
        if (content.length > 0) {
            setUserMessage(content)
            inputRef.current.value = ''
        }
    }, [setUserMessage])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef}></textarea>
            <button onClick={sendMessage}>
                <FaPlay />
            </button>
        </div>
    )
}

export default UserInput
