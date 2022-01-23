import { InjectionToken, Injector } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PipeInjectionRequisites } from "../model";
import { SkeletalPipe } from "../skeletal-pipe";
import { Indexed, ExtendedPaginationEventPrescription, 
    updateLengthForChangedDataAndViaPositioningAnchorElementUpdateAnchorIndex } from "./model";

export interface DataPipe<T> {
    connect(rawDataInput$: Observable<T[]>): void,
    disconnect(): void,
    getStream(): BehaviorSubject<Indexed<T>[]>,
    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>>,
}

export const DATA_PIPE_FACTORY_TOKEN = new InjectionToken<<T>() => DataPipe<T>>('Data pipe factory DI token');
export const getDataPipeInjectionRequisites = <T>(injector?: Injector): PipeInjectionRequisites<DataPipe<T>> => {
    return {
        factoryInjectionToken: DATA_PIPE_FACTORY_TOKEN,
        defaultFactory: () => new DataPipeImpl<T>(),
        injector
    }
}

export class DataPipeImpl<T> extends SkeletalPipe<T[], Indexed<T>[], BehaviorSubject<Indexed<T>[]>> 
        implements DataPipe<T> {

    getPaginationEventPrescription(): ExtendedPaginationEventPrescription<Indexed<T>> {
        return updateLengthForChangedDataAndViaPositioningAnchorElementUpdateAnchorIndex; 
    }

    protected initializeState(): BehaviorSubject<Indexed<T>[]> {
        return new BehaviorSubject<Indexed<T>[]>([]);
    }

    protected pipe(input$: Observable<T[]>): Observable<Indexed<T>[]> {
        return input$.pipe(map(data => this.indexData(data)));
    }

    private indexData(data: T[]): Indexed<T>[] {
        return data.map((entry: T, index: number) => this.addIndexToEntry(entry, index));
    }

    private addIndexToEntry(entry: T, index: number): Indexed<T> {
        return {...entry, _index: index};
    }

    protected getName(): string {
        return 'Data';
    }
}