import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, InjectionToken, Input, Output, Type } from '@angular/core';
import { Router } from '@angular/router';
import { LIST_SERVICE_TOKEN, ListService } from '../data/list-service';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.scss'
})
export class GenericListComponent<TElement, TListService extends ListService<TElement>> {
  @Input() public keysAsColumns: { [key: string]: string } = {};
  @Input() public isSelector: boolean = false;
  @Input() public newElementButtonLabel: string = 'New Element';

  @Output() onElementClick = new EventEmitter<TElement>();
  @Output() hoveringElement = new EventEmitter<{element:TElement|null, mousePosition:{x:number, y:number}|null}>();

  public sortedElements:TElement[] = [];

  private sortDirection: { [key: string]: boolean } = {};

  public hoveredElement: TElement | null = null;

  public mousePosition: { x: number, y: number }|null = null;

  public get elementKeys():string[] {
    return Object.keys(this.elementsService.newElement as any);
  }
  public getElementValue(element:TElement, key:string):string {
    return (element as any)[key];
  }

  constructor(@Inject(LIST_SERVICE_TOKEN) public elementsService:TListService, private router:Router) {
    this.initialize();
  }

  async initialize() {
    await this.elementsService.reloadElements();
    this.sortedElements = [...this.elementsService.elements]
  }

  public onElementHoverStart(element:TElement) {
    this.hoveredElement = element;
  }
  public onElementHoverEnd(element:TElement) {
    if (this.hoveredElement === element) {
      this.hoveredElement = null;
    }
    this.hoveringElement.emit({element:null, mousePosition:null});
  }

  public async addNewElement() {
    this.elementsService.selectedElementCopy = this.elementsService.newElement;
    this.elementsService.selectedElementIsNew = true; 
  }

  public sortTable(column:string) {
    const direction:boolean = this.sortDirection[column] = !this.sortDirection[column];

    this.sortedElements.sort((a:any, b:any) => {
      if (a[column]! < b[column]!) {
        return direction ? -1 : 1;
      }
      if (a[column]! > b[column]!) {
        return direction ? 1 : -1;
      }
      return 0;
    });
  }

  @HostListener('document:mousemove', ['$event'])
  private onMouseMove(event: MouseEvent) {
    this.mousePosition = { x: event.pageX, y: event.pageY };

    if (this.hoveredElement !== null) {
      this.hoveringElement.emit({element:this.hoveredElement, mousePosition:this.mousePosition});
    }
  }
}
