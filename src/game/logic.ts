import { getCompletion } from '../lib/openai'

async function getGenre (): Promise<string> {
    const { content } = await getCompletion([
        {
            role: 'system',
            content: 'Be concise, do not explain or respond in full sentences'
        },
        {
            role: 'user',
            content: 'Can you provide a unique genre for my RPG adventure game?'
        }
    ])

    return content
}

export {
    getGenre
}
