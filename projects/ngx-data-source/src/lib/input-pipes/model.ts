import { InjectionToken, Injector } from "@angular/core";
import { FilterSortAndDataInputPlummer } from "./filtering-sorting-data/model";
import { PageSizeAndIndexInputPlummer } from "./pagination/model";

export interface PipeInjectionRequisites<P> {
    factoryInjectionToken: InjectionToken<() => P>,
    defaultFactory: () => P,
    injector: Injector | undefined
}

export interface PipesCombinatorInjectionRequisites<P> {
    factoryInjectionToken: InjectionToken<(injector?: Injector) => P>,
    defaultFactory: (injector?: Injector) => P,
    injector: Injector | undefined
}

export interface PipesInputPlummer<T, F> 
    extends FilterSortAndDataInputPlummer<T, F>, PageSizeAndIndexInputPlummer {} 