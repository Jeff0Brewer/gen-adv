import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const ai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

async function getCompletion(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const completion = await ai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        // ChatCompletionMessageParam type from openai is private. I want to die.
        /* eslint-disable-next-line */
        messages: req.body.messages
    })

    const message = completion.choices[0].message
    res.status(200).json(message)
}

export default getCompletion
