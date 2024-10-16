import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import styles from '@/styles/app.module.css'

interface UserInputProps {
    chat: ChatMessage[]
    setChat: (c: ChatMessage[]) => void
}

function UserInput(
    { chat, setChat }: UserInputProps
): ReactElement {
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = useCallback(() => {
        if (!inputRef.current) {
            throw new Error('No reference to dom element')
        }

        const message: ChatMessage = {
            role: 'user',
            content: inputRef.current.value,
            source: {
                description: 'Message sent by user.'
            }
        }
        setChat([...chat, message])

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
