import { InjectionToken, Injector } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
import { PaginationEventPrescription, PaginatorState } from "../../data-paginator/model";
import { Indexed } from "../filtering-sorting-data/model";
import { PipeInjectionRequisites } from "../model";
import { SkeletalPipe } from "../skeletal-pipe";
import { PageSize } from "./model";

export interface PageSizePipe<T> {
    connect(rawPageSizeChangeEvents$: Observable<PageSize>): void,
    disconnect(): void,
    getStream(): ReplaySubject<PaginationEventPrescription<Indexed<T>>>
}

export const PAGE_SIZE_PIPE_FACTORY_TOKEN = 
    new InjectionToken<<T>() => PageSizePipe<T>>('Page size pipe factory DI token');
export const getPageSizePipeInjectionRequisites = 
    <T>(injector?: Injector): PipeInjectionRequisites<PageSizePipe<T>> => {
        return {
            factoryInjectionToken: PAGE_SIZE_PIPE_FACTORY_TOKEN,
            defaultFactory: () => new PageSizePipeImpl<T>(),
            injector
        }
    }

export class PageSizePipeImpl<T> 
    extends SkeletalPipe<
                PageSize, 
                PaginationEventPrescription<Indexed<T>>, 
                ReplaySubject<PaginationEventPrescription<Indexed<T>>>
            > 
    implements PageSizePipe<T> {
    
    protected initializeState(): ReplaySubject<PaginationEventPrescription<Indexed<T>>> {
        return new ReplaySubject<PaginationEventPrescription<Indexed<T>>>(1);
    }

    protected getName(): string {
        return 'Page size';
    }

    protected pipe(events$: Observable<PageSize>): Observable<PaginationEventPrescription<Indexed<T>>> {
        return events$.pipe(
            map(pageSizeEvent => this.composePaginationEventPrescription(pageSizeEvent))
        );
    }

    private composePaginationEventPrescription(pageSizeEvent: PageSize): PaginationEventPrescription<Indexed<T>> {
        return (data: Indexed<T>[], currentState: PaginatorState<Indexed<T>>) => {
            return this.defensiveCopy(pageSizeEvent);
        }
    }

    private defensiveCopy(pageSizeEvent: PageSize): PageSize {
        return { pageSize: pageSizeEvent.pageSize };
    }
}