import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Messwert } from '../interfaces/messwert.model';
import { MesswertHistoryService } from '../services/messwert-history.service';

@Component({
  selector: 'app-messwert-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messwert-slider.component.html',
  styleUrls: ['./messwert-slider.component.scss']
})
export class MesswertSliderComponent implements OnInit, OnChanges {
  @Input() messwerte: Messwert[] = [];
  @Output() dataChange = new EventEmitter<Messwert[]>();
  
  currentStep = 0;
  maxSteps = 0;
  currentData: Messwert[] = [];

  constructor(private historyService: MesswertHistoryService) {}

  ngOnInit() {
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
  }

  updateData() {
    this.maxSteps = this.historyService.getMaxHistorySteps(this.messwerte);
    this.currentStep = 0;
    this.emitCurrentData();
  }

  onSliderChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentStep = parseInt(input.value, 10);
    this.emitCurrentData();
  }

  // Go further back in time (increase steps back)
  goBackInTime() {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
      this.emitCurrentData();
    }
  }

  // Go forward toward latest data (decrease steps back)
  goForwardInTime() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.emitCurrentData();
    }
  }

  emitCurrentData() {
    this.currentData = this.historyService.getHistoricalData(this.messwerte, this.currentStep);
    this.dataChange.emit(this.currentData);
  }

  getCurrentViewLabel(): string {
    if (this.currentStep === 0) {
      return 'Neueste Daten (MOMENTAN)';
    } else {
      return `${this.currentStep} Schritt${this.currentStep > 1 ? 'e' : ''} zurück im Verlauf`;
    }
  }

  // Helper method to calculate the slider value for display
  getSliderValue(): number {
    return this.currentStep;
  }

  // Helper to get the reverse value for visual representation if needed
  getVisualSliderValue(): number {
    return this.maxSteps - this.currentStep;
  }
}