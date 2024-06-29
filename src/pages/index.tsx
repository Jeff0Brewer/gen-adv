import type { ReactElement } from 'react'
import Head from 'next/head'
import App from '../components/app'
import GameProvider from '../components/game-provider'

function Home(): ReactElement {
    return (
        <>
            <Head>
                <title>gen adventure</title>
                <meta name="description" content="Adventure game powered by generative ai" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GameProvider>
                <App />
            </GameProvider>
        </>
    )
}

export default Home
