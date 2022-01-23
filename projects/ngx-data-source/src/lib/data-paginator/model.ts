export interface PaginatorState<T> {
    pageIndex: number,
    pageSize: number,
    length: number
    anchorIndex: number,
    anchorElement?: T
}

export type PaginatorStateUpdate<T> = Partial<Omit<PaginatorState<T>, 'pageIndex'>> 

export type PaginationEventPrescription<T> = 
    (data: T[], currentState: PaginatorState<T>) => PaginatorStateUpdate<T>

export type DataAndPaginationEventPrescription<T> = {
    data: T[],
    paginationEventPrescription: PaginationEventPrescription<T>
}    

export type DataAndPaginatorState<T> = {
    data: T[],
    paginatorState: PaginatorState<T>
}