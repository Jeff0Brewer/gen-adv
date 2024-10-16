import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import styles from '../styles/app.module.css'

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

    const completion = await res.json() as ChatMessage

    return completion
}

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([
        { role: 'user', content: 'hello' }
    ])

    useEffect(() => {
        const updateChat = async (): Promise<void> => {
            if (chat[chat.length - 1].role === 'user') {
                const completion = await getCompletion(chat)
                setChat([...chat, completion])
            }
            console.log(chat)
        }

        updateChat().catch(console.error)
    }, [chat])

    return (
        <main className={styles.app}>
            {chat.map(msg => <p>{msg.content}</p>)}
        </main>
    )
}

export default App
