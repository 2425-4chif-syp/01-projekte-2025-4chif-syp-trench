import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessungListComponent } from './messung-list.component';

describe('MessungListComponent', () => {
  let component: MessungListComponent;
  let fixture: ComponentFixture<MessungListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessungListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessungListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
