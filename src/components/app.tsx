import type { Chat } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import ChatView from '@/components/chat-view'
import UserInput from '@/components/user-input'
import { generateGenre, getCompletion } from '@/lib/generation'
import { staticSystemPrompt, staticUserPrompt } from '@/lib/messages'
import { isResolved } from '@/lib/util'
import styles from '@/styles/app.module.css'

function App(): ReactElement {
    const [chat, setChat] = useState<Chat>([])

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
                staticSystemPrompt('Act as narrator for an open-ended RPG game.'),
                // Generate genre separately to improve variability.
                generateGenre(),
                staticUserPrompt('I want to start a new game, describe my surroundings.')
            ])
        }
        else if (chat[chat.length - 1]?.role === 'user') {
            // Generate narration if last message from user.
            setChat([
                ...chat,
                getCompletion(chat)
            ])
        }
    }, [chat])

    return (
        <main className={styles.app}>
            <section className={styles.chat}>
                <ChatView chat={chat} />
                <UserInput chat={chat} setChat={setChat} />
            </section>
        </main>
    )
}

export default App
