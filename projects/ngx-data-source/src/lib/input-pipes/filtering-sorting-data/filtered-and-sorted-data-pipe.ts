import { InjectionToken, Injector } from "@angular/core";
import { combineLatest, MonoTypeOperatorFunction, Observable } from "rxjs";
import { delay, map, skip, withLatestFrom } from "rxjs/operators";
import { DataAndPaginationEventPrescription, PaginationEventPrescription, 
  PaginatorState } from "../../data-paginator/model";
import { PipesCombinatorInjectionRequisites } from "../model";
import { SkeletalPipesCombinator } from "../skeletal-pipes-combinator";
import { DataPipe, getDataPipeInjectionRequisites } from "./data-pipe";
import { FilterPipe, getFilterPipeInjectionRequisites } from "./filter-pipe";
import { CompareFunction, Indexed, Filter, ExtendedPaginationEventPrescription, 
  FilterSortAndDataInputPlummer} from "./model";
import { getSortPipeInjectionRequisites, SortPipe } from "./sort-pipe";

export interface FilteredAndSortedDataPipe<T, F> {
  getFilterSortAndDataInputPlummer(): FilterSortAndDataInputPlummer<T, F>,
  getDataWithPaginationPrescriptionStream(): Observable<DataAndPaginationEventPrescription<Indexed<T>>>,
  disconnect(): void,
}

export const FILTERED_AND_SORTED_DATA_PIPE_FACTORY_TOKEN = 
  new InjectionToken<
        <T, F = keyof T>(injector?: Injector) => FilteredAndSortedDataPipe<T, F>
      >('Filtered and sorted data pipe DI token');
export const getFilteredAndSortedDataPipeInjectionRequisites = 
  <T, F = keyof T>(injector?: Injector): PipesCombinatorInjectionRequisites<FilteredAndSortedDataPipe<T, F>> => {
    return {
      factoryInjectionToken: FILTERED_AND_SORTED_DATA_PIPE_FACTORY_TOKEN,
      defaultFactory: (injector?: Injector) => new FilteredAndSortedDataPipeImpl<T, F>(injector),
      injector
    };
  }

export class FilteredAndSortedDataPipeImpl<T, F = keyof T> 
          extends SkeletalPipesCombinator<DataAndPaginationEventPrescription<Indexed<T>>>
          implements FilteredAndSortedDataPipe<T, F> {

  private _dataPipe!: DataPipe<T>;
  private _filterPipe!: FilterPipe<T>;
  private _sortPipe!: SortPipe<T, F>;

  constructor(injector?: Injector) {
    super(),
    this.initializeInputPipes(injector);
    this.initializeOutputPipe();
  }

  disconnect() {
    this.disconnectOutput();

    this._sortPipe.disconnect();
    this._filterPipe.disconnect();
    this._dataPipe.disconnect();
  }

  getFilterSortAndDataInputPlummer(): FilterSortAndDataInputPlummer<T, F> {
    return {
      connectDataPipe: rawInputEvents$ => this._dataPipe.connect(rawInputEvents$),
      connectFilterPipe: rawFilterEvents$ => this._filterPipe.connect(rawFilterEvents$),
      connectSortPipe: rawSortEvents$ => this._sortPipe.connect(rawSortEvents$) 
    };
  }

  getDataWithPaginationPrescriptionStream(): Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
    return this.getOutput().asObservable();
  }

  private initializeInputPipes(injector?: Injector) {
    this._dataPipe = this.getInitializedPipe<DataPipe<T>>(getDataPipeInjectionRequisites(injector));
    this._filterPipe = this.getInitializedPipe<FilterPipe<T>>(getFilterPipeInjectionRequisites(injector));
    this._sortPipe = this.getInitializedPipe<SortPipe<T, F>>(getSortPipeInjectionRequisites(injector));
  }

  private initializeOutputPipe(): void {
    this.mergeToOutput(
      this.getFilteredSortedDataAndPaginationPrescriptionOnNewDataEvent(),
      this.getSortedDataAndPaginationPrescriptionOnFilterEvent(),
      this.getFilteredDataAndPaginationPrescriptionOnSortEvent()
    );
  }

  private getFilteredSortedDataAndPaginationPrescriptionOnNewDataEvent():
      Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
    return  this._dataPipe.getStream().pipe(
              this.ensureThatInCaseOfRaceConditionNewDataGetsPrecedence(),
              withLatestFrom(this._filterPipe.getStream(), this._sortPipe.getStream()),
              map(([data, filter, compareFunction]) => data.filter(filter).sort(compareFunction)),
              map(data => this.composeOutputObject(data, this._dataPipe.getPaginationEventPrescription()))
            );
  }

  private ensureThatInCaseOfRaceConditionNewDataGetsPrecedence(): MonoTypeOperatorFunction<Indexed<T>[]> {
    return delay(0);
  }

  private getSortedDataAndPaginationPrescriptionOnFilterEvent(): 
      Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
    return  this._filterPipe.getStream().pipe(
              this.ensureThatPipeHasBeenConnected<Filter<T>>(),
              withLatestFrom(this.getSortedUnfilteredData()),
              map(([filter, sortedData]) => sortedData.filter(filter)),
              map(data => this.composeOutputObject(data, this._filterPipe.getPaginationEventPrescription()))
            );
  }

  private getFilteredDataAndPaginationPrescriptionOnSortEvent():
    Observable<DataAndPaginationEventPrescription<Indexed<T>>> {
      return  this._sortPipe.getStream().pipe(
                this.ensureThatPipeHasBeenConnected<CompareFunction<Indexed<T>>>(),
                withLatestFrom(this.getFilteredUnsortedData()),
                map(([compareFunction, data]) => data.sort(compareFunction)),
                map(data => this.composeOutputObject(data, this._sortPipe.getPaginationEventPrescription()))
              );
  }

  private ensureThatPipeHasBeenConnected<P>(): MonoTypeOperatorFunction<P> {
    return skip(1);
  }  

  private getSortedUnfilteredData(): Observable<Indexed<T>[]> {
    return  combineLatest([this._sortPipe.getStream(), this._dataPipe.getStream()]).pipe(
              map(([compareFunction, data]) => data.sort(compareFunction))
            );
  }

  private getFilteredUnsortedData(): Observable<Indexed<T>[]> {
    return  combineLatest([this._filterPipe.getStream(), this._dataPipe.getStream()]).pipe(
              map(([filter, data]) => data.filter(filter))
            );
  }

  private composeOutputObject(
    data: Indexed<T>[], 
    paginationEventPrescription: ExtendedPaginationEventPrescription<Indexed<T>>
  ): DataAndPaginationEventPrescription<Indexed<T>> {
    return { 
      data, 
      paginationEventPrescription: this.reduceExtendedPaginationEventPrescription(paginationEventPrescription) 
    };
  }

  private reduceExtendedPaginationEventPrescription(
    paginationEventPrescription: ExtendedPaginationEventPrescription<Indexed<T>>
  ): PaginationEventPrescription<Indexed<T>> {
    return (data: Indexed<T>[], currentState: PaginatorState<Indexed<T>>) =>
      paginationEventPrescription(data, this._sortPipe.getStream().getValue(), currentState);
  }
}