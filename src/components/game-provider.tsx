import type { Message } from '../lib/openai'
import type { ReactElement, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { genGenre, genPlayerState } from '../game/init'
import { updateStory } from '../game/update'
import GameContext from '../hooks/game-context'
import { lastRoleIs } from '../lib/openai'

async function initGame(
    setGenre: (g: string) => void,
    setStatus: (s: string) => void,
    setInventory: (i: string[]) => void
): Promise<void> {
    const genre = await genGenre()
    setGenre(genre)

    const { status, inventory } = await genPlayerState(genre)
    setStatus(status)
    setInventory(inventory)
}

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
        initGame(
            setGenre,
            setStatus,
            setInventory
        ).catch(console.error)
    }, [])

    useEffect(() => {
        if (
            genre === null
            || status === null
            || inventory === null
            || userMessage === null
            || lastRoleIs(history, 'user')
        ) { return }

        const storyPrompt: Message[] = [
            ...history,
            { role: 'user', content: userMessage }
        ]
        setUserMessage(null)

        updateStory(genre, status, inventory, storyPrompt)
            .then(setHistory)
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
