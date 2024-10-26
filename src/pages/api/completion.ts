import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionMessageParam } from 'openai/src/resources/index.js'
import OpenAI from 'openai'

const MODEL = 'gpt-3.5-turbo'

const ai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

interface CompletionNextApiRequest extends NextApiRequest {
    body: {
        messages: ChatCompletionMessageParam[]
    }
}

async function getCompletion(req: CompletionNextApiRequest, res: NextApiResponse): Promise<void> {
    const completion = await ai.chat.completions.create({
        model: MODEL,
        messages: req.body.messages
    })

    // TODO: improve validation for completion responses.
    // Just send first choice for now.
    res.status(200).json(completion.choices[0].message)
}

export default getCompletion
