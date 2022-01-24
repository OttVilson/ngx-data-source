import { InjectionToken, Injector } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map, scan } from "rxjs/operators";
import { PaginatorState } from "../../data-paginator/model";
import { PipeInjectionRequisites } from "../model";
import { SkeletalPipe } from "../skeletal-pipe";
import { CompareFunction, DirectedSortFT, Indexed, isDirectedSortFT, ExtendedPaginationEventPrescription, 
    SortFT } from "./model";

export interface SortPipe<T, F = T> {
    connect(rawSortEvents$: Observable<SortFT<T, F>>): void,
    disconnect(): void,
    getStream(): BehaviorSubject<CompareFunction<Indexed<T>>>,
    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>>,
}

export const SORT_PIPE_FACTORY_TOKEN = new InjectionToken<<T, F>() => SortPipe<T, F>>('Sort pipe factory DI token');
export const getSortPipeInjectionRequisites = 
    <T, F>(injector?: Injector): PipeInjectionRequisites<SortPipe<T, F>> => {
        return {
            factoryInjectionToken: SORT_PIPE_FACTORY_TOKEN,
            defaultFactory: () => new SortPipeImpl<T, F>(),
            injector
        }
    }  

export class SortPipeImpl<T, F = T> 
            extends SkeletalPipe<
                        SortFT<T, F>, 
                        CompareFunction<Indexed<T>>, 
                        BehaviorSubject<CompareFunction<Indexed<T>>>
                    > 
            implements SortPipe<T, F> {

    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>> {
        return (
            data: Indexed<T>[], 
            compareFunction: CompareFunction<Indexed<T>>, 
            currentState: PaginatorState<Indexed<T>>
        ) => {
            const anchorElement = data[currentState.anchorIndex];
            return { anchorElement };
        };
    }

    protected pipe(input$: Observable<SortFT<T, F>>): Observable<CompareFunction<Indexed<T>>> {
        return input$.pipe(
            scan((sortState, update) => this.accumulateSort(sortState, update), [this.getInitialDirectedSort()]),
            map(sortOrder => this.getCompareFunction(sortOrder))
        );
    }

    protected initializeState(): BehaviorSubject<CompareFunction<Indexed<T>>> {
        return new BehaviorSubject<CompareFunction<Indexed<T>>>(this.getInitialDirectedSort().compareFunction);
    }

    private getInitialDirectedSort(): DirectedSortFT<Indexed<T>, Indexed<F>> {
        const indexedOrdering: DirectedSortFT<Indexed<T>, Indexed<F>> = {
            active: '_index',
            direction: 'asc',
            compareFunction: (f, s) => f._index - s._index 
        }

        return indexedOrdering;
    }

    private accumulateSort(
        sortState: DirectedSortFT<Indexed<T>, Indexed<F>>[],
        currentSort: SortFT<T, F>
    ): DirectedSortFT<Indexed<T>, Indexed<F>>[] {
        let updatedSortState = sortState.filter(sort => currentSort.active !== sort.active);

        if (isDirectedSortFT<Indexed<T>, Indexed<F>>(currentSort))
            updatedSortState.unshift(currentSort);

        return updatedSortState;
    }

    private getCompareFunction(sortOrder: DirectedSortFT<Indexed<T>, Indexed<F>>[]): CompareFunction<Indexed<T>> {
        return (first: Indexed<T>, second: Indexed<T>) => this.compare(sortOrder, first, second);
    }
    
    private compare(
        sortOrder: DirectedSortFT<Indexed<T>, Indexed<F>>[],
        first: Indexed<T>, 
        second: Indexed<T>
    ): number {
        for (let i = 0; i < sortOrder.length; i++) {
            let result = sortOrder[i].compareFunction(first, second);
            if (result) return result * this.directionMultiplier(sortOrder[i]);
        }
    
        return 0;
    }

    private directionMultiplier(sort: DirectedSortFT<Indexed<T>, Indexed<F>>): number {
        return sort.direction === 'asc' ? +1 : -1;
    }

    protected getName(): string {
        return 'Sort';
    }
}