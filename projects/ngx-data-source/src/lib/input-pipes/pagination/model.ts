import { Observable } from "rxjs";

export interface PageSize {
    pageSize: number
}

export interface PageIndex {
    pageIndex: number
}

export interface PageSizeAndIndexInputPlummer {
    connectPageSizePipe: (rawPageSizeChangeEvents$: Observable<PageSize>) => void,
    connectPageChangePipe: (rawPageIndexChangeEvents$: Observable<PageIndex>) => void
}