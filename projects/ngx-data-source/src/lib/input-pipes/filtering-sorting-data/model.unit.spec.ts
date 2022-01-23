import { binarySearch, CompareFunction } from "./model";

fdescribe('Unit tests for helper functions', () => {
    const numberComparator = (f: number, s: number) => f - s;
describe('Binary search', () => {
describe('Even number of elements', () => {
    let array: number[];
    let anchorElement: number;
    let result: number;

    function performSearch(): number {
        return binarySearch<number>(array, numberComparator, anchorElement);
    } 

    beforeEach(() => {
        array = [0, 1, 2, 3];
    })

    it('should return 0 if the array is empty', () => {
        array = [];
        anchorElement = 23;
        result = performSearch();
        expect(result).toEqual(0);
    })

    it('should return the index of the element if the element is present in the array', () => {
        anchorElement = 0;
        result = performSearch();
        expect(result).toEqual(0);

        anchorElement = 1;
        result = performSearch();
        expect(result).toEqual(1);

        anchorElement = 2;
        result = performSearch();
        expect(result).toEqual(2);

        anchorElement = 3;
        result = performSearch();
        expect(result).toEqual(3);
    })

    it('should return 0 if all the elements in the array are bigger than the anchor element', () => {
        anchorElement = -1;
        result = performSearch();
        expect(result).toEqual(0);
    });

    it('should return the length of the array if all the elements in the array are smaller than ' +
            'the anchor element', () => {
        anchorElement = 4;
        result = performSearch();
        expect(result).toEqual(array.length);
    });

    it('should return the number of elements smaller than the anchor element, ' + 
            'if the anchor element is not present in the array', () => {
        anchorElement = -0.5;
        result = performSearch();
        expect(result).toEqual(0);

        anchorElement = 0.5;
        result = performSearch();
        expect(result).toEqual(1);

        anchorElement = 1.5;
        result = performSearch();
        expect(result).toEqual(2);

        anchorElement = 2.5;
        result = performSearch();
        expect(result).toEqual(3);

        anchorElement = 3.5;
        result = performSearch();
        expect(result).toEqual(4);
    })
})
describe('Odd number of elements', () => {
    let array: number[];
    let anchorElement: number;
    let result: number;

    function performSearch(): number {
        return binarySearch<number>(array, numberComparator, anchorElement);
    } 

    beforeEach(() => {
        array = [0, 1, 2, 3, 4];
    });

    it('should return 0 if the array contains one element which is equal to the anchor element', () => {
        array = [0];
        anchorElement = 0
        result = performSearch();
        expect(result).toEqual(0);
    });

    it('should return 0 if the array contains one element which is bigger than the anchor element', () => {
        array = [0];
        anchorElement = -1;
        result = performSearch();
        expect(result).toEqual(0);
    });

    it('should return 1 if the array contains one element which is smaller than the anchor element', () => {
        array = [0];
        anchorElement = 1;
        result = performSearch();
        expect(result).toEqual(1);
    });

    it('should return the index of the element if the element is present in the array', () => {
        anchorElement = 0;
        result = performSearch();
        expect(result).toEqual(0);

        anchorElement = 1;
        result = performSearch();
        expect(result).toEqual(1);

        anchorElement = 2;
        result = performSearch();
        expect(result).toEqual(2);

        anchorElement = 3;
        result = performSearch();
        expect(result).toEqual(3);

        anchorElement = 4;
        result = performSearch();
        expect(result).toEqual(4);
    });

    it('should return the number of elements smaller than the anchor element if the anchor element is not ' + 
            'in the array', () => {
        anchorElement = -0.5;
        result = performSearch();
        expect(result).toEqual(0);

        anchorElement = 0.5;
        result = performSearch();
        expect(result).toEqual(1);

        anchorElement = 1.5;
        result = performSearch();
        expect(result).toEqual(2);

        anchorElement = 2.5;
        result = performSearch();
        expect(result).toEqual(3);

        anchorElement = 3.5;
        result = performSearch();
        expect(result).toEqual(4);

        anchorElement = 4.5;
        result = performSearch();
        expect(result).toEqual(5);
    });
})
describe('Objects in array', () => {
    let array: {value: number}[] = [
        { value: 0 },
        { value: 1 },
        { value: 2 },
    ];

    let comparator: CompareFunction<{ value: number}> = (f: { value: number}, s: { value: number }) => f.value - s.value;

    it('should return the number of objects less than the anchor element object', () => {
        let anchorElement: { value: number } = { value: 1.5 };
        let result = binarySearch<{ value: number }>(array, comparator, anchorElement);
        expect(result).toEqual(2);
    })
})
})
})