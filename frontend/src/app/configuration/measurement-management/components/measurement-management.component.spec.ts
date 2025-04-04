import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeasurementManagementComponent } from './measurement-management.component';


describe('ComponentsComponent', () => {
  let component: MeasurementManagementComponent;
  let fixture: ComponentFixture<MeasurementManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
