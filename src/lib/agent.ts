import type { Message } from './messages'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { getCompletion } from './generation'

interface ContentFormatter {
    format: (c: string) => string
    description: string
}

interface AgentOptions {
    // Names of other agents to include in completion request.
    includedAgents?: string[]
    // Formatter for raw completion content.
    formatter?: ContentFormatter
    // Should agent use formatted output of other agents.
    useFormatted?: boolean
    // Should agent always format output regardless of other agents' options.
    alwaysFormat?: boolean
}

class Agent {
    name: string
    prompt: Message
    options: AgentOptions

    constructor(name: string, instruction: string, options: AgentOptions) {
        this.name = name
        this.prompt = {
            agent: 'system',
            content: instruction,
            source: { description: 'Agent instruction prompt.' }
        }
        this.options = options
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

    async getCompletion(chat: Message[], retries = 3, reasoning: Message[][] = []): Promise<Message> {
        let messages = [...chat]

        if (this.options.useFormatted) {
            messages = messages.map(
                message => (message?.formatted && message.agent !== this.name)
                    ? message.formatted
                    : message
            )
        }

        if (this.options.includedAgents) {
            const agents = this.options.includedAgents
            messages = messages.filter(
                message => (
                    message.agent === this.name
                    || agents.includes(message.agent)
                )
            )
        }

        messages = [this.prompt, ...messages]

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
        reasoning.push([...messages, { ...completion }])

        if (!this.options.formatter) {
            completion.source.reasoning = reasoning
            return completion
        }

        let formattedContent = 'FORMAT ERROR'
        try {
            formattedContent = this.options.formatter.format(completion.content)
        }
        catch (e) {
            console.error(e)
            if (retries > 0) {
                console.log(`Retrying generation for agent '${this.name}'`)
                return this.getCompletion(chat, retries - 1, reasoning)
            }
        }

        completion.source.reasoning = reasoning
        completion.formatted = {
            agent: this.name,
            content: formattedContent,
            source: {
                description: this.options.formatter.description,
                reasoning: reasoning
            }
        }

        return this.options.alwaysFormat
            ? completion.formatted
            : completion
    }
}

export default Agent
