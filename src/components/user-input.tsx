import type { Message } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import styles from '@/styles/user-input.module.css'

interface UserInputProps {
    sendMessage: (m: Message) => boolean
}

function UserInput(
    { sendMessage }: UserInputProps
): ReactElement {
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendInput = useCallback(() => {
        const content = inputRef.current?.value
        if (!content) {
            throw new Error('No content in user input.')
        }

        const success = sendMessage({
            agent: 'user',
            content,
            source: { description: 'User input.' }
        })

        if (success) {
            inputRef.current.value = ''
        }
    }, [sendMessage])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef}></textarea>
            <button onClick={sendInput}>send</button>
        </div>
    )
}

export default UserInput
