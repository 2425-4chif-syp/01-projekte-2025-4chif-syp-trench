import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoilParentComponent } from './messung-parent.component';

describe('CoilParentComponent', () => {
  let component: CoilParentComponent;
  let fixture: ComponentFixture<CoilParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoilParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoilParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
