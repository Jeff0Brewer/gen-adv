import type { Chat } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { createMessage } from '@/lib/messages'
import styles from '@/styles/user-input.module.css'

interface UserInputProps {
    chat: Chat
    setChat: (c: Chat) => void
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
