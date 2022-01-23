import { InjectionToken, Injector } from "@angular/core";
import { OperatorFunction, pipe } from "rxjs";
import { scan } from "rxjs/operators";
import { Indexed } from "../input-pipes/filtering-sorting-data/model";
import { PipeInjectionRequisites } from "../input-pipes/model";
import { PageSize } from "../input-pipes/pagination/model";
import { DataAndPaginationEventPrescription, DataAndPaginatorState, PaginationEventPrescription, 
    PaginatorState, PaginatorStateUpdate } from "./model";

export interface DataPaginatorState<T> {
    updatePaginatorStateAndEmitTheResultWithInputData(): 
        OperatorFunction<DataAndPaginationEventPrescription<Indexed<T>>, DataAndPaginatorState<Indexed<T>>>,
    sliceData(data: Indexed<T>[], paginatorState: PaginatorState<Indexed<T>>): Indexed<T>[]
}

export const DATA_PAGINATOR_FACTORY_TOKEN = 
    new InjectionToken<<T>(pageSize?: PageSize) => DataPaginatorState<T>>('Data paginator factory DI token'); 
export const getDataPaginatorStateInjectionRequisites = 
    <T>(injector?: Injector): PipeInjectionRequisites<DataPaginatorState<T>> => {
        return {
            factoryInjectionToken: DATA_PAGINATOR_FACTORY_TOKEN,
            defaultFactory: (pageSize?: PageSize) => new DataPaginatorStateImpl<T>(pageSize),
            injector
        }
    } 

export class DataPaginatorStateImpl<T> implements DataPaginatorState<T> {
    
    private initialState: DataAndPaginatorState<Indexed<T>>;

    constructor(pageSize?: PageSize) {
        this.initialState = this.combineInitialState(pageSize);
    }

    updatePaginatorStateAndEmitTheResultWithInputData() 
            : OperatorFunction<DataAndPaginationEventPrescription<Indexed<T>>, 
                               DataAndPaginatorState<Indexed<T>>> {
        return  pipe(
                    scan((currentState, update) => this.getUpdatedDataAndPaginatorState(currentState, update),
                         this.initialState)
                );                                   
    }

    sliceData(data: Indexed<T>[], paginatorState: PaginatorState<Indexed<T>>): Indexed<T>[] {
        const { startIndex, endIndex } = { ...this.calculateIndexesWithPossibleEndIndexOverflow(paginatorState) };
        return this.sliceWithEndIndexOverflowHandledByUnderlyingMethod(data, startIndex, endIndex);
    }

    private combineInitialState(pageSize?: PageSize): DataAndPaginatorState<Indexed<T>> {
        const update: PaginatorStateUpdate<Indexed<T>> = pageSize ? this.defensiveCopy(pageSize) : {};
        return {
            data: [],
            paginatorState: this.mergePaginatorStateUpdates(this.getZeroPaginatorState(), update)
        }
    }

    private getUpdatedDataAndPaginatorState(
        currentState: DataAndPaginatorState<Indexed<T>>,
        dataAndPaginationPrescription: DataAndPaginationEventPrescription<Indexed<T>>
    ): DataAndPaginatorState<Indexed<T>> {
        const { data, paginationEventPrescription } = { ...dataAndPaginationPrescription };
        let paginatorState = currentState.paginatorState;
        paginatorState = this.getUpdatedPaginatorState(paginatorState, data, paginationEventPrescription);
        return { data, paginatorState };
    }
    
    private calculateIndexesWithPossibleEndIndexOverflow(paginatorState: PaginatorState<Indexed<T>>): 
            { startIndex: number, endIndex: number } {
        const startIndex = paginatorState.pageIndex * paginatorState.pageSize;
        const endIndex = startIndex + paginatorState.pageSize;
        return { startIndex, endIndex };
    }

    private sliceWithEndIndexOverflowHandledByUnderlyingMethod(
        data: Indexed<T>[], 
        startIndex: number, 
        endIndex: number
    ): Indexed<T>[] {
        return data.slice(startIndex, endIndex);
    }

    private defensiveCopy(pageSize: PageSize): PageSize {
        return { pageSize: pageSize.pageSize };
    }

    private mergePaginatorStateUpdates(
        currentState: PaginatorState<Indexed<T>>, 
        update: PaginatorStateUpdate<Indexed<T>>
    ): PaginatorState<Indexed<T>> {
        const updatedState = { ...currentState, ...update };
        if (!this.isValidState(updatedState)) return currentState;

        return this.reEvaluatePageIndexAndPageSize(updatedState);
    }
    
    private getZeroPaginatorState(): PaginatorState<Indexed<T>> {
        return {
            pageIndex: 0,
            pageSize: 0,
            length: 0,
            anchorIndex: 0
        };
    }

    private getUpdatedPaginatorState(
        currentPaginatorState: PaginatorState<Indexed<T>>,
        data: Indexed<T>[],
        paginationEventPrescription: PaginationEventPrescription<Indexed<T>>
    ): PaginatorState<Indexed<T>> {
        const paginationEvent = paginationEventPrescription(data, currentPaginatorState);
        return this.mergePaginatorStateUpdates(currentPaginatorState, paginationEvent);
    }

    private isValidState(state: PaginatorState<Indexed<T>>): boolean {
        return  this.areNumbersNonNegative(state) &&
                this.isAnchorIndexCompatibleWithLength(state);
    }

    private reEvaluatePageIndexAndPageSize(state: PaginatorState<Indexed<T>>): PaginatorState<Indexed<T>> {
        state.pageIndex = this.evaluatePageIndex(state);        
        state.pageSize = this.reEvaluatePageSize(state);
        return state;
    }

    private areNumbersNonNegative(state: PaginatorState<Indexed<T>>): boolean {
        return  state.pageIndex >= 0 &&
                state.pageSize >= 0 &&
                state.length >= 0 &&
                state.anchorIndex >= 0;
    }

    private isAnchorIndexCompatibleWithLength(state: PaginatorState<Indexed<T>>): boolean {
        return state.anchorIndex === 0 || state.anchorIndex < state.length;
    }

    private evaluatePageIndex(state: PaginatorState<Indexed<T>>): number {
        if (state.pageSize === 0) return 0;
        else return Math.floor(state.anchorIndex / state.pageSize);
    }

    private reEvaluatePageSize(state: PaginatorState<Indexed<T>>): number {
        if (state.pageSize) return state.pageSize;
        else return state.length;
    }
}