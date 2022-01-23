import { HotObservable } from "rxjs/internal/testing/HotObservable";
import { mapTo } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { Indexed, SortFT } from "./model";
import { SortPipe, SortPipeImpl } from "./sort-pipe";

type TestObject = {
    description: string,
    nested: {
        value: number,
        desc: string
    },
    array: number[]    
}

type FlattenedTestObject = {
    description: string,
    nestedValue: number,
    arrayLength: number
}

function stringCompareFunction(first: string, second: string): number {
    let uFirst = first.toUpperCase();
    let uSecond = second.toUpperCase();

    if (uFirst < uSecond) return -1;
    if (uSecond > uFirst) return +1;
    return 0;
}

const sortEvents: { [key in 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i']: SortFT<TestObject, FlattenedTestObject>} = {
    a: { active: 'description', direction: '', 
            compareFunction: (f, s) => stringCompareFunction(f.description, s.description) },
    b: { active: 'description', direction: 'asc', 
            compareFunction: (f, s) => stringCompareFunction(f.description, s.description) },
    c: { active: 'description', direction: 'desc', 
            compareFunction: (f, s) => stringCompareFunction(f.description, s.description) },
    d: { active: 'nestedValue', direction: '', compareFunction: (f, s) => f.nested.value - s.nested.value },
    e: { active: 'nestedValue', direction: 'asc', compareFunction: (f, s) => f.nested.value - s.nested.value },
    f: { active: 'nestedValue', direction: 'desc', compareFunction: (f, s) => f.nested.value - s.nested.value },
    g: { active: 'arrayLength', direction: '', compareFunction: (f, s) => f.array.length - s.array.length },
    h: { active: 'arrayLength', direction: 'asc', compareFunction: (f, s) => f.array.length - s.array.length },
    i: { active: 'arrayLength', direction: 'desc', compareFunction: (f, s) => f.array.length - s.array.length }
}

const testObjects: Indexed<TestObject>[] = [
    { description: '', nested: { value: 2, desc: ''}, array: [1, 2, 3], _index: 0 }
]

fdescribe('Default Sort Pipe\'s unit tests', () => {
describe('Input-output piping', () => {
    let scheduler: TestScheduler;
    let rawSortInput$: HotObservable<SortFT<TestObject, FlattenedTestObject>>;
    let sortPipe: SortPipe<TestObject, FlattenedTestObject>;
    let sortInputMarbles: string;
    let mainThreadMarbles: string;
    let connectSortPipe: () => void = () => sortPipe.connect(rawSortInput$);
    let disconnectFromSortPipe: () => void = () => sortPipe.disconnect();  

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
        sortPipe = new SortPipeImpl();
    })
    
    it('should subscribe to the input observable when the method connect of SortPipeImpl is invoked, ' +
            'and unsubscribe when the disconnect method is called', () => {
        scheduler.run(({expectSubscriptions, cold, hot}) => {
            sortInputMarbles =          '----------';
            const subscriptionMarbles = '--^----!--';
            mainThreadMarbles =         '--C----D--';

            rawSortInput$ = hot(sortInputMarbles, sortEvents);

            cold(mainThreadMarbles, { C: connectSortPipe, D: disconnectFromSortPipe })
                .subscribe(f => f());

            expectSubscriptions(rawSortInput$.subscriptions).toBe(subscriptionMarbles);
        })
    });

    it('should process input and emit the results to the output stream', () => {        
        scheduler.run(({expectObservable, hot}) => {
            sortInputMarbles =                      'a--b-c----e--i';
            const expectedSimplifiedOutputMarbles = '1--1-1----1--1';

            rawSortInput$ = hot(sortInputMarbles, sortEvents);
            const simplifiedOutput$ = sortPipe.getStream().pipe(mapTo('1'));

            sortPipe.connect(rawSortInput$);

            expectObservable(simplifiedOutput$).toBe(expectedSimplifiedOutputMarbles);
        });
    });

    it('should ignore sort events before the SortPipe has been connected, and after the disconnect' + 
            'method has been called; given a hot input observable the connection moment should be included ' + 
            'and disconnect moment should be excluded', () => {
        scheduler.run(({expectObservable, hot, cold}) => {
            sortInputMarbles =                      'a-b-c--d-e';
            const expectedSimplifiedOutputMarbles = '--1-1-----';
            mainThreadMarbles =                     '--C----D--';

            rawSortInput$ = hot(sortInputMarbles, sortEvents);
            const simplifiedOutput$ = sortPipe.getStream().pipe(mapTo('1'));

            cold(mainThreadMarbles, { C: connectSortPipe, D: disconnectFromSortPipe })
                .subscribe(f => f());

            expectObservable(simplifiedOutput$).toBe(expectedSimplifiedOutputMarbles);
        });
    });

    it('should not propagate an error from the input observable but unsubscribe instead; ' + 
            'later disconnect should not introduce errors in output', () => {
        scheduler.run(({expectObservable, expectSubscriptions, hot, cold}) => {
            sortInputMarbles =               '-----#';
            mainThreadMarbles =              '--C-----D';
            const inputSubscriptionMarbles = '--^--!---';
            const output =                   '---------';

            rawSortInput$ = hot(sortInputMarbles, sortEvents);

            cold(mainThreadMarbles, { C: connectSortPipe, D: disconnectFromSortPipe })
                .subscribe(f => f());

            expectSubscriptions(rawSortInput$.subscriptions).toBe(inputSubscriptionMarbles);
            expectObservable(sortPipe.getStream()).toBe(output);
        });
    });
})

describe('Pagination events', () => {
    it('should provide PaginatorStateUpdate event where anchorElement is updated to be the element at the ' + 
            'position of the anchor index', () => {
        
    })
})
})