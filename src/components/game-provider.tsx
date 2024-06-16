import type { ReactElement, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { genGenre, initPlayerState } from '../game/logic'
import GameContext from '../hooks/game-context'

type GameProviderProps = {
    children: ReactNode
}

function GameProvider (
    { children }: GameProviderProps
): ReactElement {
    const [genre, setGenre] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [inventory, setInventory] = useState<string[] | null>(null)

    useEffect(() => {
        genGenre().then(setGenre)
    }, [])

    useEffect(() => {
        if (genre) {
            initPlayerState(genre).then(({ status, inventory }) => {
                setStatus(status)
                setInventory(inventory)
            })
        }
    }, [genre])

    return (
        <GameContext.Provider value={{
            genre,
            status,
            inventory
        }}>
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider
