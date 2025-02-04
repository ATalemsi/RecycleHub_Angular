import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeCollecteComponent } from './demande-collecte.component';

describe('DemandeCollecteComponent', () => {
  let component: DemandeCollecteComponent;
  let fixture: ComponentFixture<DemandeCollecteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeCollecteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandeCollecteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
