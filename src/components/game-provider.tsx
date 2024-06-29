import type { ReactElement, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { genGenre, genPlayerState } from '../game/init'
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

    return (
        <GameContext.Provider value={{
            genre,
            status,
            inventory
        }}
        >
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider
