import { expect, test } from 'vitest'
import {
    ensureArray,
    randomChoice
} from '../../src/lib/util'

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

test('ensureArray returns array containing passed string', () => {
    expect(ensureArray('string')).toEqual(['string'])
})

test('ensureArray returns same reference if passed array', () => {
    const array = ['some', 12, true, {}]
    expect(ensureArray(array)).toBe(array)
})

test('ensureArray returns array of null if passed null', () => {
    expect(ensureArray(null)).toEqual([null])
})
