import type { Message } from './messages'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { getCompletion } from './generation'

class Agent {
    name: string
    prompt: Message

    constructor(name: string, instruction: string) {
        this.name = name
        this.prompt = {
            agent: 'system',
            content: instruction,
            source: { description: 'Agent instruction prompt.' }
        }
    }

    // TODO: make readable.
    toPerspective(chat: Message[]): ChatCompletionMessageParam[] {
        return chat.map(
            ({ agent, content }) => {
                const role
                    = agent === 'user'
                        ? 'user'
                        : agent === this.name
                            ? 'assistant'
                            : 'system'
                return { role, content }
            }
        )
    }

    async getCompletion(chat: Message[]): Promise<Message> {
        const messages = [this.prompt, ...chat]

        const { content } = await getCompletion(this.toPerspective(messages))
        if (typeof content !== 'string') {
            throw new Error(`Completion failed for agent '${this.name}'`)
        }

        const completion: Message = {
            agent: this.name,
            content,
            source: {
                description: `Completion from agent '${this.name}'`
            }
        }

        // Wierd copy to keep completion output in source history.
        // Reevaluate later.
        completion.source.reasoning = [[...messages, { ...completion }]]

        return completion
    }
}

export default Agent
