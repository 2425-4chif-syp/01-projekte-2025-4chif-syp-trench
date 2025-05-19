import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplacementCalculationTestComponent } from './displacement-calculation-test.component';

describe('DisplacementCalculationTestComponent', () => {
  let component: DisplacementCalculationTestComponent;
  let fixture: ComponentFixture<DisplacementCalculationTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplacementCalculationTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisplacementCalculationTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
