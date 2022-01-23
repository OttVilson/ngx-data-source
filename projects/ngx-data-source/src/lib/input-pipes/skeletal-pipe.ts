import { Observable, Subscription, EMPTY, Subject } from "rxjs";
import { catchError } from "rxjs/operators";

export abstract class SkeletalPipe<I, O, S extends Subject<O>> {
    private _subscription: Subscription | undefined = undefined;
    private _state$: S;

    constructor() {
        this._state$ = this.initializeState();
    }

    connect(input$: Observable<I>): void {
        if (this._subscription) throw new Error(this.getName() + 'pipe has already been connected.')

        this.connectPipe(input$);
    }

    disconnect(): void {
        this._subscription?.unsubscribe();
        this._state$.complete();
    }

    getStream(): S {
        return this._state$;
    }

    protected abstract initializeState(): S;

    protected abstract getName(): string;

    private connectPipe(input$: Observable<I>): void {
        const inputWithCompleteOnError$: Observable<I> = 
            input$.pipe(catchError(error => this.completeOnError(error)));

        this._subscription = this.pipe(inputWithCompleteOnError$).subscribe(
            result => this._state$.next(result)
        );
    }

    protected abstract pipe(input$: Observable<I>): Observable<O>;

    private completeOnError(error: any): Observable<I> {
        console.log(error);
        return EMPTY;
    }    
} 