import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import UserInput from '@/components/user-input'
import { systemPrompt, userPrompt } from '@/lib/messages'
import { randomChoice } from '@/lib/util'
import styles from '@/styles/app.module.css'

interface ChatViewProps {
    chat: ChatMessage[]
}

function ChatView(
    { chat }: ChatViewProps
): ReactElement {
    return (
        <section className={styles.chat}>
            {chat.map(({ role, content }, i) => (
                <div className={styles.message} data-role={role} key={i}>
                    <label>{role}</label>
                    <p>{content}</p>
                </div>
            ))}
        </section>
    )
}

function App(): ReactElement {
    const [chat, setChat] = useState<ChatMessage[]>([])

    // Initialize game chat.
    useEffect(() => {
        const initGameChat = async (): Promise<void> => {
            const genreMessage = await generateGenre()
            const chat: ChatMessage[] = [
                systemPrompt('Act as narrator for an open-ended RPG game.'),
                genreMessage,
                userPrompt('I want to start a new game, describe my surroundings.')
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
                <ChatView chat={chat} />
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

async function generateGenre(retries = 3, reasoning: ChatMessage[][] = []): Promise<ChatMessage> {
    const prompt: ChatMessage[] = [
        userPrompt('Provide 10 interesting genres for an RPG game.'),
        systemPrompt('Write your answer in JSON format: { genres: [/* Your genre ideas here */] }')
    ]

    const completion = await getCompletion(prompt)

    reasoning.push([...prompt, completion])

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
            return generateGenre(retries - 1, reasoning)
        }
        else {
            throw new Error('generateGenre reached its retry limit.')
        }
    }

    // Pick a random option from list of results to increase variability.
    const genre = randomChoice(obj.genres)

    // Return as message to preserve source history.
    return {
        role: 'system',
        content: `The genre of the game is ${genre}.`,
        source: {
            description: `Genre '${genre}' was chosen at random from a generated list of genres.`,
            reasoning
        }
    }
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
