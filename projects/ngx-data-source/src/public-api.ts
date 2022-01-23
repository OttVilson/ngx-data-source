/*
 * Public API Surface of ngx-data-source
 */
export * from './lib/ngx-data-source.module';

export { NgxDataSource, NgxDataSourceImpl } from './lib/ngx-data-source';

export { PaginatorState, PaginatorStateUpdate, PaginationEventPrescription, 
    DataAndPaginationEventPrescription, DataAndPaginatorState } from './lib/data-paginator/model';
export { DataPaginatorState, DATA_PAGINATOR_FACTORY_TOKEN } from './lib/data-paginator/data-paginator';

export { ExtendedPaginationEventPrescription, Indexed, Filter, Sort, SortFT, CompareFunction,findAnchorIndex, 
    FilterSortAndDataInputPlummer } from './lib/input-pipes/filtering-sorting-data/model';
export { DataPipe, DATA_PIPE_FACTORY_TOKEN } from './lib/input-pipes/filtering-sorting-data/data-pipe';
export { FilterPipe, FILTER_PIPE_FACTORY_TOKEN } from './lib/input-pipes/filtering-sorting-data/filter-pipe';
export { SortPipe, SORT_PIPE_FACTORY_TOKEN } from './lib/input-pipes/filtering-sorting-data/sort-pipe';
export { FilteredAndSortedDataPipe, FILTERED_AND_SORTED_DATA_PIPE_FACTORY_TOKEN } from 
    './lib/input-pipes/filtering-sorting-data/filtered-and-sorted-data-pipe';


export { PageSize, PageIndex, PageSizeAndIndexInputPlummer } from './lib/input-pipes/pagination/model';
export { PageChangePipe, PAGE_CHANGE_PIPE_FACTORY_TOKEN } from './lib/input-pipes/pagination/page-change-pipe'; 
export { PageSizePipe, PAGE_SIZE_PIPE_FACTORY_TOKEN } from './lib/input-pipes/pagination/page-size-pipe';
export { PaginatorEventsPipe, PAGINATOR_PIPE_FACTORY_INJECTION_TOKEN } from 
    './lib/input-pipes/pagination/paginator-pipe';

export { PipesInputPlummer } from './lib/input-pipes/model';
