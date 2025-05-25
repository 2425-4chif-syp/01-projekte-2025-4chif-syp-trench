import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { GenericListComponent } from '../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../generic-list/services/list-service';
import { Messung } from '../interfaces/messung';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messung-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: MessungService
    }
  ],
  templateUrl: './messung-list.component.html',
  styleUrl: './messung-list.component.scss'
})
export class MessungListComponent {

  public get isMessungSelector(): boolean {
    return this.messungService.isMessungSelector;
  }

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Messung',
    'messeinstellungId': 'Messeinstellung',
    'anfangszeitpunkt': 'Anfang',
    'endzeitpunkt': 'Ende',
    'name': 'Name',
    'tauchkernstellung': 'Tauchkernstellung',
    'pruefspannung': 'Prüfspannung'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Messung) => string } = {
  }

  constructor(public messungService:MessungService, private router:Router) {

  }

  openMessung(coil:Messung) {
    
  }
}
