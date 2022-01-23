import { DataSource } from "@angular/cdk/collections";
import { Injector } from "@angular/core";
import { BehaviorSubject, MonoTypeOperatorFunction, Observable, ReplaySubject, Subscription } from "rxjs";
import { skip } from "rxjs/operators";
import { DataPaginatorState, getDataPaginatorStateInjectionRequisites } from "./data-paginator/data-paginator";
import { DataAndPaginatorState, PaginatorState } from "./data-paginator/model";
import { ExternalUpdatesPipe, ExternalUpdatesPipeImpl } from "./input-pipes/external-updates-pipe";
import { Indexed } from "./input-pipes/filtering-sorting-data/model";
import { PipesInputPlummer } from "./input-pipes/model";
import { PageSize } from "./input-pipes/pagination/model";

export interface CustomDataSource<T, F> {
    connect(): Observable<readonly T[]>,
    disconnect(): void,
    getInputPlummer(): PipesInputPlummer<T, F>,
    getPaginatorState(): Observable<PaginatorState<Indexed<T>>>,
    getCurrentData(): Indexed<T>[]
}

export class CustomDataSourceImpl<T, F = T> implements DataSource<T>, CustomDataSource<T, F> {

    private _externalUpdates: ExternalUpdatesPipe<T, F>;
    private _dataAndPaginationEventPrescriptionPipeSubscription!: Subscription;
    
    private _dataPaginatorState!: DataPaginatorState<T>;
    private _dataOutput$: BehaviorSubject<Indexed<T>[]>;
    private _paginatorStateOutput$: ReplaySubject<PaginatorState<Indexed<T>>>;

    constructor(initialPageSize?: PageSize, injectorForCustomizations?: Injector) {
        this._externalUpdates = new ExternalUpdatesPipeImpl<T, F>(injectorForCustomizations);
        this._dataPaginatorState = this.getInitializedDataPaginatorState(initialPageSize, injectorForCustomizations);
        this._dataOutput$ = this.initializeAsBehaviorSubjectToHaveGetValueMethod();
        this._paginatorStateOutput$ = this.initializeAsReplaySubjectImmediatelyEmittingExternalUpdatesInitialValue();
        this.connectInputToOutput();
    }

    connect(): Observable<readonly T[]> {
        return this._dataOutput$.pipe(this.skipFirstAsExternalUpdatesAlsoProvideInitialValue());
    }
    
    disconnect(): void {
        this._dataAndPaginationEventPrescriptionPipeSubscription.unsubscribe();
        this._externalUpdates.disconnect();

        this._dataOutput$.complete();
        this._paginatorStateOutput$.complete();
    }

    getInputPlummer(): PipesInputPlummer<T, F> {
        return this._externalUpdates.getPipesInputPlummer();
    }

    getPaginatorState(): Observable<PaginatorState<Indexed<T>>> {
        return this._paginatorStateOutput$.asObservable();
    }

    getCurrentData(): Indexed<T>[] {
        return this._dataOutput$.getValue();
    }

    private getInitializedDataPaginatorState(pageSize?: PageSize, injector?: Injector): DataPaginatorState<T> {
        const { factoryInjectionToken, defaultFactory } = 
            { ...getDataPaginatorStateInjectionRequisites<T>(injector) };
        const factory = injector?.get<(pageSize?: PageSize) => DataPaginatorState<T>>
                                    (factoryInjectionToken, defaultFactory) 
                            || defaultFactory;
        return factory(pageSize);                    
    }

    private initializeAsBehaviorSubjectToHaveGetValueMethod(): BehaviorSubject<Indexed<T>[]> {
        return new BehaviorSubject([] as Indexed<T>[]);
    }

    private initializeAsReplaySubjectImmediatelyEmittingExternalUpdatesInitialValue(): 
            ReplaySubject<PaginatorState<Indexed<T>>> {
        return new ReplaySubject(1);
    }

    private connectInputToOutput() {
        this._dataAndPaginationEventPrescriptionPipeSubscription =
            this._externalUpdates.getDataAndPaginationEventPrescriptionStream().pipe(
                this._dataPaginatorState.updatePaginatorStateAndEmitTheResultWithInputData()
            ).subscribe(
                dataAndPaginatorState => this.connectToOutput(dataAndPaginatorState)
            );
    }

    private skipFirstAsExternalUpdatesAlsoProvideInitialValue(): MonoTypeOperatorFunction<Indexed<T>[]> {
        return skip(1)
    }

    private connectToOutput(dataAndPaginatorState: DataAndPaginatorState<Indexed<T>>): void {
        const { data, paginatorState } = { ...dataAndPaginatorState };
        const slicedData = this._dataPaginatorState.sliceData(data, paginatorState);
        this._paginatorStateOutput$.next(paginatorState);
        this._dataOutput$.next(slicedData);
    }
}