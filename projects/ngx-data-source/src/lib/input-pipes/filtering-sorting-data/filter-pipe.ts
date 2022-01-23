import { InjectionToken, Injector } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { PipeInjectionRequisites } from "../model";
import { SkeletalPipe } from "../skeletal-pipe"
import { Filter, Indexed, ExtendedPaginationEventPrescription, 
    updateLengthForChangedDataAndViaPositioningAnchorElementUpdateAnchorIndex } from "./model"

export interface FilterPipe<T> {
    connect(rawFilterEvents$: Observable<Filter<T>>): void;
    disconnect(): void,
    getStream(): BehaviorSubject<Filter<T>>,
    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>>,
}

export const FILTER_PIPE_FACTORY_TOKEN = new InjectionToken<<T>() => FilterPipe<T>>('Filter pipe factory DI token');
export const getFilterPipeInjectionRequisites = <T>(injector?: Injector): PipeInjectionRequisites<FilterPipe<T>> => {
    return {
        factoryInjectionToken: FILTER_PIPE_FACTORY_TOKEN,
        defaultFactory: () => new FilterPipeImpl<T>(),
        injector
    }
}

export class FilterPipeImpl<T> extends SkeletalPipe<Filter<T>, Filter<T>, BehaviorSubject<Filter<T>>> 
        implements FilterPipe<T> {

    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>> {
        return updateLengthForChangedDataAndViaPositioningAnchorElementUpdateAnchorIndex;
    } 

    protected initializeState(): BehaviorSubject<Filter<T>> {
        return new BehaviorSubject<Filter<T>>(t => true);
    }

    protected pipe(input$: Observable<Filter<T>>): Observable<Filter<T>> {
        return input$;
    }

    protected getName(): string {
        return 'Filter';
    }
}