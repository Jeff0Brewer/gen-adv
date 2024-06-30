import type { Message } from '../lib/openai'
import type { ReactElement, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { genGenre, genPlayerState } from '../game/init'
import { updateInventory, updateStatus, updateStory } from '../game/update'
import GameContext from '../hooks/game-context'
import { lastRoleIs } from '../lib/openai'

interface GameProviderProps {
    children: ReactNode
}

function GameProvider(
    { children }: GameProviderProps
): ReactElement {
    const [genre, setGenre] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [inventory, setInventory] = useState<string[] | null>(null)
    const [history, setHistory] = useState<Message[]>([])
    const [userMessage, setUserMessage] = useState<string | null>(
        'I\'d like to start the game, describe my surroundings.'
    )

    useEffect(() => {
        const initGame = async (): Promise<void> => {
            console.log('Initializing game.')

            const genre = await genGenre()
            setGenre(genre)

            const { status, inventory } = await genPlayerState(genre)
            setStatus(status)
            setInventory(inventory)
        }

        initGame().catch(console.error)
    }, [])

    useEffect(() => {
        // Ensure required game elements have been initialized.
        const isLoaded = genre !== null && status !== null && inventory !== null
        // Ensure that user message exists and is responding to assistant.
        const isSendable = userMessage !== null && !lastRoleIs(history, 'user')
        if (!isLoaded || !isSendable) {
            return
        }

        const sendUserMessage = async (): Promise<Message[]> => {
            console.log('Sending user message.')

            // Clear user message to prevent sending multiple times.
            setUserMessage(null)

            const updated = await updateStory(
                genre,
                status,
                inventory,
                [
                    ...history,
                    { role: 'user', content: userMessage }
                ]
            )

            setHistory(updated)
            return updated
        }

        const updatePlayerState = async (history: Message[]): Promise<void> => {
            console.log('Updating player state.')

            const [newStatus, newInventory] = await Promise.all([
                updateStatus(status, history),
                updateInventory(inventory, history)
            ])
            setStatus(newStatus)
            setInventory(newInventory)
        }

        sendUserMessage()
            .then(updatePlayerState)
            .catch(console.error)
    }, [genre, status, inventory, history, userMessage])

    const story = useMemo(() =>
        history
            .filter(({ role }) => role === 'assistant')
            .pop()?.content
            ?? ''
    , [history])

    return (
        <GameContext.Provider value={{
            genre,
            status,
            inventory,
            story,
            setUserMessage
        }}
        >
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider
