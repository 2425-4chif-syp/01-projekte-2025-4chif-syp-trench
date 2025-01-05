import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoiltypeManagementComponent } from './coiltype-management.component';

describe('CoiltypeManagementComponent', () => {
  let component: CoiltypeManagementComponent;
  let fixture: ComponentFixture<CoiltypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoiltypeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoiltypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
