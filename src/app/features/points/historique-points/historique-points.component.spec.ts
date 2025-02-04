import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriquePointsComponent } from './historique-points.component';

describe('HistoriquePointsComponent', () => {
  let component: HistoriquePointsComponent;
  let fixture: ComponentFixture<HistoriquePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriquePointsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoriquePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
