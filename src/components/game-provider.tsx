import type { ReactElement, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { getGenre } from '../game/logic'
import GameContext from '../hooks/game-context'

type GameProviderProps = {
    children: ReactNode
}

function GameProvider (
    { children }: GameProviderProps
): ReactElement {
    const [genre, setGenre] = useState<string | null>(null)

    useEffect(() => {
        getGenre().then(setGenre)
    }, [])

    return (
        <GameContext.Provider value={{ genre }}>
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider
