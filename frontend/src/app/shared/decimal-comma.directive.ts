import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appDecimalComma]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DecimalCommaDirective),
      multi: true
    }
  ]
})
export class DecimalCommaDirective implements ControlValueAccessor {
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  handleInput(value: string): void {
    if (value == null || value === '') {
      this.onChange(null);
      return;
    }

    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    this.onChange(Number.isFinite(parsed) ? parsed : null);
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    const input = this.elementRef.nativeElement;
    if (value === null || value === undefined) {
      input.value = '';
    } else {
      input.value = String(value);
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }
}
