import type { Message } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import ChatView from '@/components/chat-view'
import UserInput from '@/components/user-input'
import Agent from '@/lib/agent'
import { isResolved, randomChoice } from '@/lib/util'
import { isGenreOptions, isItemsList } from '@/lib/validation'
import styles from '@/styles/app.module.css'

const GENRE = new Agent(
    'genre',
    'Write your answer in JSON format: { "genres": [/* Your genre ideas here */] }',
    {
        useFormatted: false,
        alwaysFormat: true
    },
    {
        format: (content: string): string => {
            const obj = JSON.parse(content) as unknown

            if (!isGenreOptions(obj)) {
                throw new Error('Genre generation output incorrect format.')
            }

            const genre = randomChoice(obj.genres)

            return `The genre of the game is ${genre}.`
        },
        description: 'Genre chosen at random from a generated list of options.'
    }
)

const NARRATOR = new Agent(
    'narrator',
    'Act as narrator for an open-ended RPG game.',
    {
        useFormatted: true,
        alwaysFormat: false
    }
)

const INVENTORY = new Agent(
    'inventory',
    'Act as assistant to the narrator of an RPG game, your only responsibility is to list items the player is currently carrying. Write your answer in JSON format: { "items": [/* Player\'s items here */] }',
    {
        useFormatted: false,
        alwaysFormat: false
    },
    {
        format: (content: string): string => {
            const obj = JSON.parse(content) as unknown

            if (!isItemsList(obj)) {
                throw new Error('Item tracking output incorrect format.')
            }

            if (obj.items.length === 0) {
                return `The player is not carrying any items.`
            }

            return `The player is currently carrying these items: ${obj.items.join(', ')}`
        },
        description: 'Items listed directly from generation output.'
    }
)

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
                // Generate genre separately to improve variability.
                GENRE.getCompletion([{
                    agent: 'user',
                    content: 'Provide 10 interesting genres for an RPG game. Be unique and creative.',
                    source: { description: 'Static prompt.' }
                }]),
                {
                    agent: 'user',
                    content: 'I want to start a new game, describe my surroundings.',
                    source: { description: 'Static prompt.' }
                }
            ])
            return
        }

        switch (chat[chat.length - 1].agent) {
            case 'user':
                // Generate narration if last message from user.
                setChat([
                    ...chat,
                    NARRATOR.getCompletion(chat)
                ])
                break
            case 'narrator':
                // Track inventory if last message from narrator.
                setChat([
                    ...chat,
                    INVENTORY.getCompletion(chat)
                ])
                break
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
