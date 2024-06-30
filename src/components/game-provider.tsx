import type { Message } from '../lib/openai'
import type { ReactElement, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { genGenre, genPlayerState } from '../game/init'
import { updateStory } from '../game/update'
import GameContext from '../hooks/game-context'

interface GameProviderProps {
    children: ReactNode
}

function GameProvider(
    { children }: GameProviderProps
): ReactElement {
    const [genre, setGenre] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [inventory, setInventory] = useState<string[] | null>(null)
    const [story, setStory] = useState<Message[]>([])
    const [userMessage, setUserMessage] = useState<string | null>(
        'I\'d like to start the game, describe my surroundings.'
    )

    useEffect(() => {
        const init = async (): Promise<void> => {
            const genre = await genGenre()
            setGenre(genre)

            const { status, inventory } = await genPlayerState(genre)
            setStatus(status)
            setInventory(inventory)
        }

        init().catch(console.error)
    }, [])

    useEffect(() => {
        if (
            genre === null
            || status === null
            || inventory === null
            || userMessage === null
        ) { return }

        const storyPrompt: Message[] = [
            ...story,
            { role: 'user', content: userMessage }
        ]
        setUserMessage(null)

        updateStory(genre, status, inventory, storyPrompt)
            .then(setStory)
            .catch(console.error)
    }, [genre, status, inventory, story, userMessage])

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
