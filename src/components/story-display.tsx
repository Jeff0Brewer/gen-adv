import type { ReactElement } from 'react'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/app.module.css'

function StoryDisplay(): ReactElement {
    const { story } = useGameContext()

    return (
        <section className={styles.story}>
            {story.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </section>
    )
}

export default StoryDisplay
