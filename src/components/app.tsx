import type { Message } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import ChatView from '@/components/chat-view'
import UserInput from '@/components/user-input'
import { generateGenre, getCompletion } from '@/lib/generation'
import { isResolved } from '@/lib/util'
import styles from '@/styles/app.module.css'

function App(): ReactElement {
    const [chat, setChat] = useState<(Message | Promise<Message>)[]>([])

    const sendUserMessage = useCallback((message: Message): boolean => {
        if (!isResolved(chat)) {
            return false
        }

        setChat([...chat, message])
        return true
    }, [chat])

    // Manage current game state.
    useEffect(() => {
        // Load all messages before generating more.
        if (!isResolved(chat)) {
            Promise.all(chat)
                .then(setChat)
                .catch(console.error)
            return
        }

        if (chat.length === 0) {
            // Initialize game if chat empty.
            setChat([
                {
                    agent: 'system',
                    content: 'Act as narrator for an open-ended RPG game.',
                    source: { description: 'Static prompt.' }
                },
                // Generate genre separately to improve variability.
                generateGenre(),
                {
                    agent: 'user',
                    content: 'I want to start a new game, describe my surroundings.',
                    source: { description: 'Static prompt.' }
                }
            ])
        }
        else if (chat[chat.length - 1].agent === 'user') {
            // Generate narration if last message from user.
            setChat([
                ...chat,
                getCompletion(chat, 'narrator')
            ])
        }
    }, [chat])

    return (
        <main className={styles.app}>
            <section className={styles.chat}>
                <ChatView chat={chat} />
                <UserInput sendMessage={sendUserMessage} />
            </section>
        </main>
    )
}

export default App
