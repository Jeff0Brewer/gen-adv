import type { ChatMessage } from '@/lib/openai'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import UserInput from '@/components/user-input'
import { randomChoice } from '@/lib/util'
import styles from '@/styles/app.module.css'

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([])

    // Initialize game chat.
    useEffect(() => {
        const initGameChat = async (): Promise<void> => {
            const genreMessage = await generateGenre()
            const chat: ChatMessage[] = [
                { role: 'system', content: 'Act as narrator for an open-ended RPG game.' },
                genreMessage,
                { role: 'user', content: 'I want to start a new game, describe my surroundings.' }
            ]
            setChat(chat)
        }

        initGameChat().catch(console.error)
    }, [])

    // Generate responses to user messages.
    useEffect(() => {
        const updateChat = async (): Promise<void> => {
            if (chat.length === 0 || chat[chat.length - 1].role !== 'user') {
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

// Output format for genre options generation.
// Responses not in this format will retry.
interface GenreOptions {
    genres: string[]
}

function isGenreOptions(obj: unknown): obj is GenreOptions {
    const typed = obj as GenreOptions

    // Ensure obj has genres field
    if (!typed?.genres) {
        return false
    }
    const { genres } = typed

    // Ensure genres field is array
    if (!Array.isArray(genres)) {
        return false
    }

    // Ensure array is exclusively strings
    return genres.reduce((p, c) => p && typeof c === 'string', true)
}

async function generateGenre(retries = 3): Promise<ChatMessage> {
    const chat: ChatMessage[] = [
        { role: 'user', content: 'Provide 10 interesting genres for an RPG game.' },
        { role: 'system', content: 'Write your answer in JSON format: { genres: [/* Your genre ideas here */] }' }
    ]

    const completion = await getCompletion(chat)

    // Parse can easily fail if completion is not valid JSON.
    let obj
    try {
        obj = JSON.parse(completion.content) as unknown
    }
    catch (e) {
        console.error(e)
    }

    // Retry generation if completion is invalid.
    if (!isGenreOptions(obj)) {
        if (retries > 0) {
            return generateGenre(retries - 1)
        }
        else {
            throw new Error('generateGenre reached its retry limit.')
        }
    }

    // Pick a random option from list of results to increase variability.
    const genre = randomChoice(obj.genres)

    // Return as message.
    return { role: 'system', content: `The genre of the game is ${genre}.` }
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
