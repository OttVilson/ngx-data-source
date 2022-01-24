import { Observable } from "rxjs";
import { PaginatorState, PaginatorStateUpdate } from "../../data-paginator/model";

export type ExtendedPaginationEventPrescription<T> = 
    (data: T[], compareFunction: CompareFunction<T>, currentState: PaginatorState<T>) => PaginatorStateUpdate<T>

export type Indexed<T> = T & { _index: number }

export type CompareFunction<T> = (first: T, second: T) => number;

export interface Sort {
    active: string,
    direction: 'asc' | 'desc' | ''
}

export interface SortFT<T, F = T> extends Sort { 
    active: keyof F & string,
    compareFunction: CompareFunction<T> 
}

export interface DirectedSortFT<T, F> extends SortFT<T, F> {
    direction: 'asc' | 'desc';
}

export const isDirectedSortFT = <T, F>(sort: SortFT<T, F>): sort is DirectedSortFT<T, F> => {
    return !!sort.direction;
}

export type Filter<T> = (t: T) => boolean

export const findAnchorIndex = <T>(
    data: Indexed<T>[],
    compareFunction: CompareFunction<Indexed<T>>, 
    anchorElement: Indexed<T> | undefined 
): number  => {
    if (!anchorElement) return 0;

    let anchorIndex = binarySearch<Indexed<T>>(data, compareFunction, anchorElement);
    return preserveUpperBoundIfAnchorElementPositionsOutOfArray(anchorIndex, data);
}

export const binarySearch = <T>(
    data: T[], 
    compareFunction: CompareFunction<T>, 
    anchorElement: T
): number => {
    let start = 0;
    let end = data.length - 1;
    while (end >= start) {
        const mid = start + Math.floor((end - start)/2);

        const result = compareFunction(data[mid], anchorElement);
        if (result < 0) start = mid + 1;
        else if (result > 0) end = mid - 1;
        else return mid;
    }
    
    return start;
}

const preserveUpperBoundIfAnchorElementPositionsOutOfArray = <T>(result: number, data: Indexed<T>[]): number => {
    if (result === data.length) return data.length - 1;
    return result;
}

export const updateLengthForChangedDataAndViaPositioningAnchorElementUpdateAnchorIndex =
    <T>(
        data: Indexed<T>[], 
        compareFunction: CompareFunction<Indexed<T>>, 
        currentState: PaginatorState<Indexed<T>>
    ) => {
        const anchorIndex: number = findAnchorIndex(data, compareFunction, currentState.anchorElement);
        return { length: data.length, anchorIndex };
    };

export interface FilterSortAndDataInputPlummer<T, F> {
    connectDataPipe: (dataEvents$: Observable<T[]>) => void,
    connectFilterPipe: (filterEvents$: Observable<Filter<T>>) => void,
    connectSortPipe: (sortEvents$: Observable<SortFT<T, F>>) => void
}