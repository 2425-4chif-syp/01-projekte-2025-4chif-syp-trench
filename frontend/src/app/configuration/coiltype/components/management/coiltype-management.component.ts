import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilVisualizationComponent } from '../../../../visualization/coil/components/coil-visualization.component';
import { CoiltypesService } from '../../services/coiltypes.service';
import { Coiltype } from '../../interfaces/coiltype';

type CoiltypeField = keyof Coiltype;
type NumericField = 'bandbreite' | 'schichthoehe' | 'durchmesser' | 'toleranzbereich';

interface NumericConstraint {
  label: string;
  unit: string;
  min: number;
  max?: number;
}

@Component({
  selector: 'app-coiltype-management',
  standalone: true,
  imports: [FormsModule, CommonModule, CoilVisualizationComponent],
  templateUrl: './coiltype-management.component.html',
  styleUrl: './coiltype-management.component.scss'
})
export class CoiltypeManagementComponent implements OnInit {
  @ViewChild('coiltypeSelectEl') coiltypeSelect?: ElementRef<HTMLSelectElement>;

  constructor(public coiltypesService: CoiltypesService) {}

  saveMessage: string | null = null;
  originalCoiltype: Coiltype | null = null;
  private formSubmitAttempted = false;
  private touchedFields = new Set<CoiltypeField>();
  validationErrors: Partial<Record<CoiltypeField, string>> = {};

  private readonly numericFieldConstraints: Record<NumericField, NumericConstraint> = {
    bandbreite: { label: 'Bandbreite', unit: 'mm', min: 0.01, max: 2000 },
    schichthoehe: { label: 'Schichthöhe', unit: 'mm', min: 0.01, max: 2000 },
    durchmesser: { label: 'Durchmesser', unit: 'mm', min: 0.01, max: 2000 },
    toleranzbereich: { label: 'Toleranzbereich', unit: 'kg', min: 0.01, max: 10000 }
  };

  private readonly fieldsToValidate: CoiltypeField[] = [
    'name',
    'schenkel',
    'bandbreite',
    'schichthoehe',
    'durchmesser',
    'toleranzbereich'
  ];

  private readonly allowedSchenkelValues = [2, 3, 4];

  public get selectedCoiltype(): Coiltype | null {
    return this.coiltypesService.selectedElementCopy;
  }
  public get selectedCoiltypeId(): number | undefined {
    return this.coiltypesService.selectedElementCopy?.id!;
  }
  public set selectedCoiltypeId(id: number) {
    this.coiltypesService.selectElement(Number(id));
  }

  ngOnInit() {
    if (this.selectedCoiltype) {
      this.originalCoiltype = { ...this.selectedCoiltype };
    }
    this.resetValidationState();
  }

  hasChanges(): boolean {
    if (!this.originalCoiltype || !this.selectedCoiltype) return false;
    return JSON.stringify(this.originalCoiltype) !== JSON.stringify(this.selectedCoiltype);
  }

  async onSubmit(form: NgForm) {
    if (!this.selectedCoiltype) return;

    this.formSubmitAttempted = true;
    form.form.markAllAsTouched();
    this.markAllFieldsTouched();
    const formIsValid = this.validateForm();

    if (!form.valid || !formIsValid) {
      this.saveMessage = 'Bitte korrigieren Sie die markierten Eingaben.';
      setTimeout(() => (this.saveMessage = null), 3000);
      return;
    }

    try {
      await this.coiltypesService.updateOrCreateElement(this.selectedCoiltype);

      // Element nach dem Speichern neu laden (falls z. B. ID neu vergeben wurde)
      if (this.selectedCoiltypeId != null) {
        await this.coiltypesService.selectElement(this.selectedCoiltypeId);
      }

      this.saveMessage = 'Änderungen gespeichert!';
      setTimeout(() => (this.saveMessage = null), 1500);

      // Change-Tracking zurücksetzen
      this.originalCoiltype = this.selectedCoiltype ? { ...this.selectedCoiltype } : null;
      form.form.markAsPristine();
      this.resetValidationState();

      // Dropdown wieder schließen, damit das Layout nicht verschoben wird
      this.coiltypeSelect?.nativeElement.blur();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      this.saveMessage = 'Fehler beim Speichern!';
    }
  }

  async onCoiltypeSelectionChange(coiltypeId: number) {
    const coiltypeIdNumber: number = Number(coiltypeId);
    await this.coiltypesService.selectElement(coiltypeIdNumber);
    this.coiltypeSelect?.nativeElement.blur();
    // Neues Original setzen, damit hasChanges korrekt ist
    if (this.selectedCoiltype) {
      this.originalCoiltype = { ...this.selectedCoiltype };
    }
    this.resetValidationState();
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async deleteCoiltype(): Promise<void> {
    this.showDeleteModal = false;
    if (this.coiltypesService.selectedElementCopy === null) return;
    await this.coiltypesService.deleteElement(this.coiltypesService.selectedElementCopy.id!);
    this.originalCoiltype = null;
  }

  backToListing(): void {
    this.coiltypesService.selectedElementCopy = null;
    this.originalCoiltype = null;
    this.resetValidationState();
  }

  onFieldBlur(field: CoiltypeField): void {
    this.touchedFields.add(field);
    this.validateField(field);
  }

  onFieldChange(field: CoiltypeField): void {
    this.validateField(field);
  }

  shouldShowFieldError(field: CoiltypeField, control?: NgModel | null): boolean {
    const hasCustomError = !!this.validationErrors[field];
    if (!hasCustomError) {
      return false;
    }

    const controlTouched = control?.touched;
    return this.formSubmitAttempted || this.touchedFields.has(field) || !!controlTouched;
  }

  fieldError(field: CoiltypeField): string | undefined {
    return this.validationErrors[field];
  }

  hasValidationErrors(): boolean {
    return Object.keys(this.validationErrors).length > 0;
  }

  private validateForm(): boolean {
    if (!this.selectedCoiltype) return false;

    this.fieldsToValidate.forEach(field => this.validateField(field));
    return Object.keys(this.validationErrors).length === 0;
  }

  private validateField(field: CoiltypeField): void {
    if (!this.selectedCoiltype) return;

    let error: string | undefined;
    const value = this.selectedCoiltype[field];

    if (this.isNumericField(field)) {
      error = this.validateNumericField(field, value as Coiltype[NumericField]);
    } else if (field === 'name') {
      const name = typeof value === 'string' ? value.trim() : '';
      if (!name) {
        error = 'Name ist erforderlich.';
      } else if (name.length < 2) {
        error = 'Name muss mindestens 2 Zeichen lang sein.';
      }
    } else if (field === 'schenkel') {
      const numericValue = typeof value === 'number' ? value : Number(value);
      if (value === null || value === undefined) {
        error = 'Bitte wählen Sie die Schenkelanzahl.';
      } else if (!this.allowedSchenkelValues.includes(numericValue)) {
        error = 'Schenkelanzahl muss 2, 3 oder 4 sein.';
      }
    }

    if (error) {
      this.validationErrors[field] = error;
    } else {
      delete this.validationErrors[field];
    }
  }

  private validateNumericField(field: NumericField, rawValue: Coiltype[NumericField] | string): string | undefined {
    const constraint = this.numericFieldConstraints[field];
    const parsed = this.parseNumber(rawValue);

    if (parsed === null) {
      return `${constraint.label} ist erforderlich.`;
    }

    if (Number.isNaN(parsed)) {
      return `${constraint.label} muss eine gültige Zahl sein.`;
    }

    if (parsed < constraint.min) {
      return `${constraint.label} muss mindestens ${constraint.min} ${constraint.unit}.`;
    }

    if (constraint.max !== undefined && parsed > constraint.max) {
      return `${constraint.label} darf höchstens ${constraint.max} ${constraint.unit} sein.`;
    }

    return undefined;
  }

  private parseNumber(rawValue: unknown): number | null {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return null;
    }

    const normalized = typeof rawValue === 'string' ? rawValue.replace(',', '.').trim() : rawValue;
    const parsed = typeof normalized === 'number' ? normalized : Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  private isNumericField(field: CoiltypeField): field is NumericField {
    return field === 'bandbreite' || field === 'schichthoehe' || field === 'durchmesser' || field === 'toleranzbereich';
  }

  private markAllFieldsTouched(): void {
    this.fieldsToValidate.forEach(field => this.touchedFields.add(field));
  }

  private resetValidationState(): void {
    this.formSubmitAttempted = false;
    this.touchedFields.clear();
    this.validationErrors = {};
    if (this.selectedCoiltype) {
      this.validateForm();
    }
  }
}
