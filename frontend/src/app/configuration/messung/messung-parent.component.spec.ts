import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessungParentComponent } from './messung-parent.component';

describe('MessungParentComponent', () => {
  let component: MessungParentComponent;
  let fixture: ComponentFixture<MessungParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessungParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessungParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
