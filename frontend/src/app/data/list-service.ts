export interface ListService<T> {
    elements: T[];
    selectedElementCopy: T | null;
    selectedElementIsNew: boolean;

    getCopyElement(id: number): T;
    reloadElements(): Promise<void>;
    reloadElementWithId(id: number): Promise<T>;
    updateOrCreateElement(element: T): Promise<void>;
    postSelectedElement(): Promise<T>;
    deleteElement(id: number): Promise<void>;
    selectElement(id: number): void;
}
