import type { Message } from '../lib/openai'
import type { ReactElement, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { genGenre, genPlayerState } from '../game/init'
import { evaluateAction, updateInventory, updateStatus, updateStory } from '../game/update'
import GameContext from '../hooks/game-context'
import { lastRoleIs } from '../lib/openai'

const START_MESSAGE = 'I\'d like to start the game. Please set the scene for this adventure.'

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
    const [userMessage, setUserMessage] = useState<string | null>(START_MESSAGE)

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

        history.push({ role: 'user', content: userMessage })
        // Clear user message to prevent sending multiple times.
        setUserMessage(null)

        const evaluateUserAction = async (): Promise<boolean> => {
            if (userMessage === START_MESSAGE) {
                return true
            }

            console.log('Evaluating user action.')

            const actionSucceeded = await evaluateAction(
                genre,
                status,
                inventory,
                history
            )

            return actionSucceeded
        }

        const sendUserAction = async (actionSucceeded: boolean): Promise<Message[]> => {
            console.log('Sending user action.')

            const updated = await updateStory(
                genre,
                status,
                inventory,
                history,
                actionSucceeded
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

            const lostItems = inventory.filter(item => !newInventory.includes(item))
            const foundItems = newInventory.filter(item => !inventory.includes(item))
            console.log('Lost items:', lostItems)
            console.log('Found items:', foundItems)

            setStatus(newStatus)
            setInventory(newInventory)
        }

        evaluateUserAction()
            .then(sendUserAction)
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
