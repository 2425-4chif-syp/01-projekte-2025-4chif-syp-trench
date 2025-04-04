import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementHistoryComponent } from '../measurement-history.component';

describe('MeasurementHistoryComponent', () => {
  let component: MeasurementHistoryComponent;
  let fixture: ComponentFixture<MeasurementHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
