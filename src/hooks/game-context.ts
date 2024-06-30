import { createContext, useContext } from 'react'

interface GameContextProps {
    genre: string | null
    status: string | null
    inventory: string[] | null
    story: string
    setUserMessage: (c: string) => void
}

const GameContext = createContext<GameContextProps | null>(null)

const useGameContext = (): GameContextProps => {
    const context = useContext(GameContext)
    if (context === null) {
        throw new Error('useGameContext must be called from a child of GameProvider')
    }
    return context
}

export default GameContext
export { useGameContext }
