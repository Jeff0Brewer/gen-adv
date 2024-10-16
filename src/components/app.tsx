import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles/app.module.css'

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

        const content = inputRef.current.value
        setChat([...chat, { role: 'user', content }])

        inputRef.current.value = ''
    }, [chat, setChat])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef}></textarea>
            <button onClick={sendMessage}>send</button>
        </div>
    )
}

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([
        { role: 'system', content: 'Act as narrator for an open-ended RPG game.' },
        { role: 'user', content: 'I want to start a new game, describe my surroundings.' }
    ])

    useEffect(() => {
        const updateChat = async (): Promise<void> => {
            if (chat[chat.length - 1].role === 'assistant') {
                return
            }

            const completion = await getCompletion(chat)
            setChat([...chat, completion])
        }

        updateChat().catch(console.error)
    }, [chat])

    return (
        <main className={styles.app}>
            <section className={styles.chat}>
                {chat.map(({ role, content }) => (
                    <div className={styles.message} data-role={role}>
                        <label>{role}</label>
                        <p>{content}</p>
                    </div>
                ))}
                <UserInput chat={chat} setChat={setChat} />
            </section>
        </main>
    )
}

// Temporary types for openai messages / completions.
type ChatRole = 'user' | 'system' | 'assistant'
interface ChatMessage {
    role: ChatRole
    content: string
}

async function getCompletion(chat: ChatMessage[]): Promise<ChatMessage> {
    const res = await fetch('/api/completion', {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chat })
    })
    return await res.json() as ChatMessage
}

export default App
