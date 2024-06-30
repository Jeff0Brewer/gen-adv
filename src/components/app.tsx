import type { ReactElement } from 'react'
import GameProvider from '../components/game-provider'
import InfoDisplay from '../components/info-display'
import StoryDisplay from '../components/story-display'
import UserInput from '../components/user-input'
import styles from '../styles/app.module.css'

function App(): ReactElement {
    return (
        <GameProvider>
            <main className={styles.app}>
                <InfoDisplay />
                <StoryDisplay />
                <UserInput />
            </main>
        </GameProvider>
    )
}

export default App
