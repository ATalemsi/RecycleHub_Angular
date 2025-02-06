import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticulierCollectionsComponent } from './particulier-collections.component';

describe('ParticulierCollectionsComponent', () => {
  let component: ParticulierCollectionsComponent;
  let fixture: ComponentFixture<ParticulierCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticulierCollectionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParticulierCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
