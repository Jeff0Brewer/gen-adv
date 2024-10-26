import type { Message } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import ChatView from '@/components/chat-view'
import UserInput from '@/components/user-input'
import Agent from '@/lib/agent'
import { isResolved, randomChoice } from '@/lib/util'
import { isGenreOptions, isHealthValue, isItemsList, isSuccessValue } from '@/lib/validation'
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

const HEALTH = new Agent(
    'health',
    'Act as assistant to the narrator of an RPG game, your only responsibility is to track the player\'s current health. Write your answer in JSON format: { "health": /* Integer in range 0-10 */}',
    {
        useFormatted: false,
        alwaysFormat: false
    },
    {
        format: (content: string): string => {
            const obj = JSON.parse(content) as unknown

            if (!isHealthValue(obj)) {
                throw new Error('Item tracking output incorrect format.')
            }

            return `The player's health is currently: ${obj.health}/10`
        },
        description: 'Health listed directly from generation output.'
    }
)

const EVALUATOR = new Agent(
    'evaluator',
    'Act as assistant to the narrator of an RPG game, your only responsibility is to determine if the player succeeds in their chosen action. Be highly realistic in your evaluations, do not let the player take implausible actions given the setting of the game. Write our answer in JSON format: { "success": /* true or false */ }',
    {
        useFormatted: false,
        alwaysFormat: false
    },
    {
        format: (content: string): string => {
            const obj = JSON.parse(content) as unknown

            if (!isSuccessValue(obj)) {
                throw new Error('Success evaluation output incorrect format.')
            }

            return obj.success
                ? 'The player succeeded in their chosen action.'
                : 'The player failed to execute their chosen action.'
        },
        description: 'Success boolean from evaluation converted to natural language.'
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
                    agent: 'evaluator',
                    content: 'Start a new game, describe the player\'s surroundings.',
                    source: { description: 'Static prompt.' }
                }
            ])
            return
        }

        switch (chat[chat.length - 1].agent) {
            case 'user':
                // Evaluate input if last message from user.
                setChat([
                    ...chat,
                    EVALUATOR.getCompletion(chat)
                ])
                break
            case 'evaluator':
                // Generate narration if last message from input evaluator.
                setChat([
                    ...chat,
                    NARRATOR.getCompletion(chat)
                ])
                break
            case 'narrator':
                // Track player inventory and health if last message from narrator.
                setChat([
                    ...chat,
                    INVENTORY.getCompletion(chat),
                    HEALTH.getCompletion(chat)
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
