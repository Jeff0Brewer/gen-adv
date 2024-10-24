import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import ChatView from '@/components/chat-view'
import UserInput from '@/components/user-input'
import { generateGenre, getCompletion } from '@/lib/generation'
import { staticSystemPrompt, staticUserPrompt } from '@/lib/messages'
import styles from '@/styles/app.module.css'

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([])

    const initGame = useCallback(async (): Promise<void> => {
        // Generate genre separately to improve variability.
        const genrePrompt = await generateGenre()

        // Initial prompt for narration.
        setChat([
            staticSystemPrompt('Act as narrator for an open-ended RPG game.'),
            genrePrompt,
            staticUserPrompt('I want to start a new game, describe my surroundings.')
        ])
    }, [])

    const generateResponse = useCallback(async (chat: ChatMessage[]): Promise<void> => {
        const completion = await getCompletion(chat)
        setChat([...chat, completion])
    }, [])

    // Manage current game state.
    useEffect(() => {
        if (chat.length === 0) {
            initGame().catch(console.error)
        }
        else if (chat[chat.length - 1]?.role === 'user') {
            generateResponse(chat).catch(console.error)
        }
    }, [chat, initGame, generateResponse])

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
