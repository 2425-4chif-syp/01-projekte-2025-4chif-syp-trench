import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessungDetailAuswertungComponent } from './messung-detail-auswertung.component';

describe('MessungDetailAuswertungComponent', () => {
  let component: MessungDetailAuswertungComponent;
  let fixture: ComponentFixture<MessungDetailAuswertungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessungDetailAuswertungComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessungDetailAuswertungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
