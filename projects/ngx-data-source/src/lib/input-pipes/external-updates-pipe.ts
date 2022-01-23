import { Injector } from "@angular/core";
import { Observable, ReplaySubject, Subscription } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { DataAndPaginationEventPrescription, PaginationEventPrescription } from "../data-paginator/model";
import { FilteredAndSortedDataPipe, 
    getFilteredAndSortedDataPipeInjectionRequisites } from "./filtering-sorting-data/filtered-and-sorted-data-pipe";
import { Indexed } from "./filtering-sorting-data/model";
import { PipesCombinatorInjectionRequisites, PipesInputPlummer } from "./model";
import { getPaginatorPipeDependecyInjectionRequisites, PaginatorEventsPipe } from "./pagination/paginator-pipe";

export interface ExternalUpdatesPipe<T, F> {
    getPipesInputPlummer(): PipesInputPlummer<T, F>,
    getDataAndPaginationEventPrescriptionStream(): Observable<DataAndPaginationEventPrescription<Indexed<T>>>,
    disconnect(): void
}

export class ExternalUpdatesPipeImpl<T, F> implements ExternalUpdatesPipe<T, F> {
    private _filteredAndSortedDataPipe!: FilteredAndSortedDataPipe<T, F>;
    private _filteredAndSortedDataPipeSubscription!: Subscription;

    private _paginatorEventsPipe!: PaginatorEventsPipe<T>;
    private _paginatorEventsPipeSubscription!: Subscription;

    private _dataAndPaginationEventPrescriptionStream$ =
        new ReplaySubject<DataAndPaginationEventPrescription<Indexed<T>>>(1);

    constructor(injector?: Injector) {
        this.initializePipesCombinators(injector);
        this.pipeFilteredAndSortedData();
        this.pipePaginatorEvents();
    }

    getPipesInputPlummer(): PipesInputPlummer<T, F> {
        return {
            ...this._filteredAndSortedDataPipe.getFilterSortAndDataInputPlummer(), 
            ...this._paginatorEventsPipe.getPageSizeAndChangeInputPlummer()
        };
    }

    getDataAndPaginationEventPrescriptionStream(): Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
        return this._dataAndPaginationEventPrescriptionStream$.asObservable();
    }

    disconnect(): void {
        this._filteredAndSortedDataPipe.disconnect();
        this._filteredAndSortedDataPipeSubscription.unsubscribe();

        this._paginatorEventsPipe.disconnect();
        this._paginatorEventsPipeSubscription.unsubscribe();

        this._dataAndPaginationEventPrescriptionStream$.complete();
    }

    private initializePipesCombinators(injector?: Injector): void {
        this._filteredAndSortedDataPipe = 
            this.getInitializedCombinedPipe<FilteredAndSortedDataPipe<T, F>>(
                getFilteredAndSortedDataPipeInjectionRequisites(injector));
        this._paginatorEventsPipe = 
            this.getInitializedCombinedPipe<PaginatorEventsPipe<T>>(
                getPaginatorPipeDependecyInjectionRequisites(injector));
    }

    private pipeFilteredAndSortedData() {
        this._filteredAndSortedDataPipeSubscription =
            this._filteredAndSortedDataPipe.getDataWithPaginationPrescriptionStream()
                .subscribe(
                    dataAndPrescription => this._dataAndPaginationEventPrescriptionStream$.next(dataAndPrescription)
                );
    }

    private pipePaginatorEvents() {
        this._paginatorEventsPipeSubscription =
            this.getRemappedPaginatorEventPrescriptionStream()
            .subscribe(
                dataAndPrescription => this._dataAndPaginationEventPrescriptionStream$.next(dataAndPrescription)
            );
    }

    private getInitializedCombinedPipe<P>(injectionRequisites: PipesCombinatorInjectionRequisites<P>): P {
        const { factoryInjectionToken, defaultFactory, injector } = {...injectionRequisites};
        const factory = injector?.get<(injector?: Injector) => P>(factoryInjectionToken, defaultFactory) 
                            || defaultFactory;
        return factory(injector);
    }

    private getRemappedPaginatorEventPrescriptionStream(): 
                Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
        return  this._paginatorEventsPipe.getPaginationEventPrescriptionStream().pipe(
                    withLatestFrom(this._filteredAndSortedDataPipe.getDataWithPaginationPrescriptionStream()),
                    map(([prescription, dataBearer]) => this.composeObject(prescription, dataBearer))
                );
    }

    private composeObject(
        prescription: PaginationEventPrescription<Indexed<T>>,
        dataBearer: DataAndPaginationEventPrescription<Indexed<T>>
    ): DataAndPaginationEventPrescription<Indexed<T>> {
        return {
            paginationEventPrescription: prescription, 
            data: dataBearer.data
        }
    }
}