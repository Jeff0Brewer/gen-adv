import { expect, test } from 'vitest'
import { randomChoice } from '../src/lib/util'

test('randomChoice returns element from list of strings', () => {
    const list = ['a', 'b', 'c', 'd', 'e']
    expect(list).toContainEqual(randomChoice(list))
})

test('randomChoice returns element from list of mixed types', () => {
    const list = ['a', 1, { item: 0 }, true, []]
    expect(list).toContainEqual(randomChoice(list))
})

test('randomChoice returns undefined on empty list', () => {
    expect(randomChoice([])).toBeUndefined()
})
