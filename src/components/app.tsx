import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import styles from '../styles/app.module.css'

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([
        { role: 'user', content: 'hello' },
        { role: 'system', content: 'Respond as a mythical creature' }
    ])

    useEffect(() => {
        const updateChat = async (): Promise<void> => {
            if (chat[chat.length - 1].role === 'assistant') {
                return
            }

            const completion = await getCompletion(chat)
            setChat([...chat, completion])
            console.log(chat)
        }

        updateChat().catch(console.error)
    }, [chat])

    return (
        <main className={styles.app}>
            <section>
                {chat.map(({ role, content }) => (
                    <div className={styles.message} data-role={role}>
                        <label>{role}</label>
                        <p>{content}</p>
                    </div>
                ))}
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
