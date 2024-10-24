import type { Chat, ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { createMessage } from '@/lib/messages'
import styles from '@/styles/user-input.module.css'

interface UserInputProps {
    sendMessage: (m: ChatMessage) => boolean
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

        const message = createMessage('user', content, { description: 'User choice.' })
        const success = sendMessage(message)

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
