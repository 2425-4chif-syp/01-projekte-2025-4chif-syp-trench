import { Directive } from '@angular/core';
import { AbstractControl, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appRange]',
  standalone: true
})
export class RangeDirective implements Validator {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    const valid = control.value > 10 && control.value < 20;
    return !valid ? { 'appRange': { value: control.value } } : null;
  }
}
