import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { GenericListComponent } from '../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../generic-list/services/list-service';
import { Messung } from '../interfaces/messung';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messung-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: MessungService
    },
    DatePipe
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
    'name': 'Name',
    'messeinstellung': 'Messeinstellung',
    'anfangszeitpunkt': 'Anfang',
    'endzeitpunkt': 'Ende',
    'tauchkernstellung': 'Tauchkernstellung',
    'pruefspannung': 'Prüfspannung'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Messung) => string } = {
    'messeinstellung': (element:Messung) => element.messeinstellung?.name ?? `Unbekannte Messeinstellung (ID ${element.messeinstellungId})`,
    'anfangszeitpunkt': (element:Messung) => this.datePipe.transform(element.anfangszeitpunkt!, 'dd.MM.yyyy HH:mm:ss') ?? `Unbekannt`,
    'endzeitpunkt': (element:Messung) => this.datePipe.transform(element.endzeitpunkt!, 'dd.MM.yyyy HH:mm:ss') ?? `Unbekannt`
  }

  constructor(public messungService:MessungService, private router:Router, private datePipe: DatePipe) {

  }

  openMessung(coil:Messung) {
    
  }
}
