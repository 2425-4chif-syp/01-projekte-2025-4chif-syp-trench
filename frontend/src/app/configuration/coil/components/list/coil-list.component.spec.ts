import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoilListComponent } from './coil-list.component';

describe('CoilListComponent', () => {
  let component: CoilListComponent;
  let fixture: ComponentFixture<CoilListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoilListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoilListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
