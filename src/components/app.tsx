import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { getCompletion } from '../lib/openai'
import styles from '../styles/app.module.css'

function App (): ReactElement {
    const [text, setText] = useState<string>('')

    useEffect(() => {
        getCompletion(
            [{ role: 'user', content: 'hi' }]
        ).then(
            ({ content }) => setText(content)
        )
    }, [])

    return (
        <main className={styles.center}>
            <p>{text}</p>
        </main>
    )
}

export default App
