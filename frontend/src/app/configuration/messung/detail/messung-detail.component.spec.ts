import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessungDetailComponent } from './messung-detail.component';

describe('DetailComponent', () => {
  let component: MessungDetailComponent;
  let fixture: ComponentFixture<MessungDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessungDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessungDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
