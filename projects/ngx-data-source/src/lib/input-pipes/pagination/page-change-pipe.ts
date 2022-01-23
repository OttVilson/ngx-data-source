import { InjectionToken, Injector } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
import { Indexed } from "../filtering-sorting-data/model";
import { SkeletalPipe } from "../skeletal-pipe";
import { PageIndex } from "./model";
import { PipeInjectionRequisites } from "../model"
import { PaginationEventPrescription, PaginatorState, PaginatorStateUpdate } from "../../data-paginator/model";

export interface PageChangePipe<T> {
    connect(rawPageChangeEvents$: Observable<PageIndex>): void,
    disconnect(): void,
    getStream(): ReplaySubject<PaginationEventPrescription<Indexed<T>>>
}

export const PAGE_CHANGE_PIPE_FACTORY_TOKEN = 
    new InjectionToken<<T>() => PageChangePipe<T>>('Page change pipe factory DI token');
export const getPageChangePipeInjectionRequisites = 
    <T>(injector?: Injector): PipeInjectionRequisites<PageChangePipe<T>> => {
        return {
            factoryInjectionToken: PAGE_CHANGE_PIPE_FACTORY_TOKEN,
            defaultFactory: () => new PageChangePipeImpl<T>(),
            injector
        }
    } 

export class PageChangePipeImpl<T> 
        extends SkeletalPipe<
                    PageIndex,
                    PaginationEventPrescription<Indexed<T>>, 
                    ReplaySubject<PaginationEventPrescription<Indexed<T>>>
                > 
        implements PageChangePipe<T> {
    
    protected initializeState(): ReplaySubject<PaginationEventPrescription<Indexed<T>>> {
        return new ReplaySubject<PaginationEventPrescription<Indexed<T>>>(1);
    }        

    protected getName(): string {
        return 'Page change'
    }

    protected pipe(events$: Observable<PageIndex>): Observable<PaginationEventPrescription<Indexed<T>>> {
        return  events$.pipe(
                    map(event => event.pageIndex),
                    map(pageIndex => this.composePaginationEventPrescription(pageIndex))
                );    
    }

    private composePaginationEventPrescription(pageIndex: number): PaginationEventPrescription<Indexed<T>> {
        return (data: Indexed<T>[], currentState: PaginatorState<Indexed<T>>) => {
                    const anchorIndex = this.getFirstIndexOnPage(pageIndex, currentState.pageSize);
                    if (this.isValidIndex(anchorIndex, currentState)) 
                        return this.composePaginatorStateUpdateForValidIndex(anchorIndex, data);
                    else return {};
        };
    }

    private isValidIndex(elementIndex: number, currentPaginatorState: PaginatorState<Indexed<T>>): boolean {
        return elementIndex === 0 || elementIndex < currentPaginatorState.length;
    }

    private composePaginatorStateUpdateForValidIndex(
        anchorIndex: number, 
        data: Indexed<T>[]
    ): PaginatorStateUpdate<Indexed<T>> {
        return  {
                    anchorIndex,
                    anchorElement: this.getAnchorElement(data, anchorIndex)
                };
    }

    private getFirstIndexOnPage(pageIndex: number, pageSize: number): number {
        return pageIndex * pageSize;
    }

    private getAnchorElement(data: Indexed<T>[], anchorIndex: number): Indexed<T> | undefined {
        if (!data.length) return undefined;

        return data[anchorIndex];
    }
}