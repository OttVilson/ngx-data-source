import { merge, Observable, ReplaySubject, Subscription } from "rxjs";
import { PipeInjectionRequisites } from "./model";

export class SkeletalPipesCombinator<P> {
    private _output$: ReplaySubject<P> = new ReplaySubject<P>(1);
    private _inputSubscription: Subscription | undefined;

    protected getOutput(): ReplaySubject<P> {
        return this._output$;
    }

    protected mergeToOutput(...inputs: Observable<P>[]) {
        const input$ = merge(...inputs);

        this._inputSubscription = input$.subscribe(
            event => this._output$.next(event)
        );
    }

    protected disconnectOutput(): void {
        this._inputSubscription?.unsubscribe();
        this._output$.complete();
    }

    protected getInitializedPipe<K>(pipeInjectionRequisites: PipeInjectionRequisites<K>): K {
        const {factoryInjectionToken, defaultFactory, injector} = {...pipeInjectionRequisites};
        const factory = injector?.get<() => K>(factoryInjectionToken, defaultFactory) || defaultFactory;
        return factory();
    }
}