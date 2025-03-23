import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, InjectionToken, Input, Type } from '@angular/core';
import { Router } from '@angular/router';
import { LIST_SERVICE_TOKEN, ListService } from '../data/list-service';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.scss'
})
export class GenericListComponent<TElement, TListService extends ListService<TElement>> {
  public sortedElements:TElement[] = [];

  private sortDirection: { [key: string]: boolean } = {};

  public hoveredElement: TElement | null = null;

  public mousePosition: { x: number, y: number }|null = null;

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
  }
}
