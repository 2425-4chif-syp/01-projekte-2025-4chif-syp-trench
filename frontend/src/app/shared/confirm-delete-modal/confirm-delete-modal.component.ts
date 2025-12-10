import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.scss'
})
export class ConfirmDeleteModalComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Eintrag löschen?';
  @Input() message: string = 'Diese Aktion kann nicht rückgängig gemacht werden.';
  @Input() confirmLabel: string = 'Löschen';
  @Input() cancelLabel: string = 'Abbrechen';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

