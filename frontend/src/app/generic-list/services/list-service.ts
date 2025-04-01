import { InjectionToken } from "@angular/core";

// Needed to inject generic ListService into the component
export const LIST_SERVICE_TOKEN = new InjectionToken<ListService<any>>('ListServiceToken');

export abstract class ListService<T> {
    abstract elements: T[];
    abstract get newElement(): T;
    abstract selectedElementCopy: T | null;
    abstract selectedElementIsNew: boolean;

    abstract getCopyElement(id: number): T;
    abstract reloadElements(): Promise<void>;
    abstract reloadElementWithId(id: number): Promise<T>;
    abstract updateOrCreateElement(element: T): Promise<void>;
    abstract postSelectedElement(): Promise<T>;
    abstract deleteElement(id: number): Promise<void>;
    abstract selectElement(id: number): void;
}
