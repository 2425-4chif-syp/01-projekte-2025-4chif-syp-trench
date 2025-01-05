import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoilManagementComponent } from './coil-management.component';

describe('CoilManagementComponent', () => {
  let component: CoilManagementComponent;
  let fixture: ComponentFixture<CoilManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoilManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoilManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
