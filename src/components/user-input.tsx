import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { type ChatMessage, createMessage } from '@/lib/messages'
import styles from '@/styles/user-input.module.css'

interface UserInputProps {
    chat: ChatMessage[]
    setChat: (c: ChatMessage[]) => void
}

function UserInput(
    { chat, setChat }: UserInputProps
): ReactElement {
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = useCallback(() => {
        const content = inputRef.current?.value
        if (!content) {
            throw new Error('No content in user input.')
        }

        setChat([
            ...chat,
            createMessage('user', content, { description: 'User choice.' })
        ])

        inputRef.current.value = ''
    }, [chat, setChat])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef}></textarea>
            <button onClick={sendMessage}>send</button>
        </div>
    )
}

export default UserInput
