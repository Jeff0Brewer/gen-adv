import type { Message } from '@/lib/messages'
import { randomChoice } from '@/lib/util'

async function getCompletion(chat: Message[], agent: string): Promise<Message> {
    const res = await fetch('/api/completion', {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agent,
            messages: chat
        })
    })

    return await res.json() as Message
}

// Output format for genre options generation.
// Responses not in this format will error.
interface GenreOptions {
    genres: string[]
}

function isGenreOptions(obj: unknown): obj is GenreOptions {
    const typed = obj as GenreOptions

    // Ensure obj has genres field
    if (!typed?.genres) {
        return false
    }
    const { genres } = typed

    // Ensure genres field is array
    if (!Array.isArray(genres)) {
        return false
    }

    // Ensure array is exclusively strings
    return genres.reduce((p, c) => p && typeof c === 'string', true)
}

async function generateGenre(retries = 3, reasoning: Message[][] = []): Promise<Message> {
    const prompt: Message[] = [
        {
            agent: 'user',
            content: 'Provide 10 interesting genres for an RPG game. Be unique and creative.',
            source: { description: 'Static prompt.' }
        },
        {
            agent: 'system',
            content: 'Write your answer in JSON format: { "genres": [/* Your genre ideas here */] }',
            source: { description: 'Static prompt.' }
        }
    ]
    const completion = await getCompletion(prompt, 'genre')

    // Push completion to reasoning history regardless of output for debug.
    reasoning.push([...prompt, completion])

    // Parse can easily fail if completion is not valid JSON.
    let obj
    try {
        obj = JSON.parse(completion.content) as unknown
    }
    catch (e) {
        console.error(e)
    }

    // Retry generation if completion is invalid.
    if (!isGenreOptions(obj)) {
        if (retries > 0) {
            return generateGenre(retries - 1, reasoning)
        }
        else {
            throw new Error('generateGenre reached its retry limit.')
        }
    }

    // Pick a random option from list of results to increase variability.
    const genre = randomChoice(obj.genres)

    // Return as message to preserve source history.
    return {
        agent: 'genre',
        content: `The genre of the game is ${genre}.`,
        source: {
            description: `Genre '${genre}' was chosen at random from a generated list of genres.`,
            reasoning
        }
    }
}

export {
    getCompletion,
    generateGenre
}
