import { InjectionToken, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { PaginationEventPrescription } from "../../data-paginator/model";
import { Indexed } from "../filtering-sorting-data/model";
import { PipesCombinatorInjectionRequisites } from "../model";
import { SkeletalPipesCombinator } from "../skeletal-pipes-combinator";
import { PageSizeAndIndexInputPlummer } from "./model";
import { getPageChangePipeInjectionRequisites, PageChangePipe } from "./page-change-pipe";
import { getPageSizePipeInjectionRequisites, PageSizePipe } from "./page-size-pipe";

export interface PaginatorEventsPipe<T> {
    getPageSizeAndChangeInputPlummer(): PageSizeAndIndexInputPlummer,
    getPaginationEventPrescriptionStream(): Observable<PaginationEventPrescription<Indexed<T>>>,
    disconnect(): void
}

export const PAGINATOR_PIPE_FACTORY_INJECTION_TOKEN = 
    new InjectionToken<<T>(injector?: Injector) => PaginatorEventsPipe<T>>('Paginator pipe factory DI token');
export const getPaginatorPipeDependecyInjectionRequisites = 
    <T>(injector?: Injector): PipesCombinatorInjectionRequisites<PaginatorEventsPipe<T>> => {
        return {
            factoryInjectionToken: PAGINATOR_PIPE_FACTORY_INJECTION_TOKEN,
            defaultFactory: (injector?: Injector) => new PaginatorEventsPipeImpl(injector),
            injector
        };
    }

export class PaginatorEventsPipeImpl<T> 
        extends SkeletalPipesCombinator<PaginationEventPrescription<Indexed<T>>> 
        implements PaginatorEventsPipe<T> {

    private _pageChangePipe!: PageChangePipe<T>;
    private _pageSizePipe!: PageSizePipe<T>;

    constructor(injector?: Injector) {
        super();
        this.initializePipes(injector);
        this.initializeOutput();
    }

    getPageSizeAndChangeInputPlummer(): PageSizeAndIndexInputPlummer {
        return {
            connectPageSizePipe: rawPageSizeEvents$ => this._pageSizePipe.connect(rawPageSizeEvents$),
            connectPageChangePipe: rawPageChangeEvents$ => this._pageChangePipe.connect(rawPageChangeEvents$)
        };
    }

    disconnect() {
        this.disconnectOutput();

        this._pageChangePipe.disconnect();
        this._pageSizePipe.disconnect();
    }

    getPaginationEventPrescriptionStream(): Observable<PaginationEventPrescription<Indexed<T>>> {
        return this.getOutput().asObservable();
    }

    private initializePipes(injector?: Injector): void {
        this._pageChangePipe = 
            this.getInitializedPipe<PageChangePipe<T>>(getPageChangePipeInjectionRequisites<T>(injector));
        this._pageSizePipe = 
            this.getInitializedPipe<PageSizePipe<T>>(getPageSizePipeInjectionRequisites<T>(injector));
    }

    private initializeOutput(): void {
        this.mergeToOutput(
            this._pageChangePipe.getStream(),
            this._pageSizePipe.getStream()
        );
    }
}