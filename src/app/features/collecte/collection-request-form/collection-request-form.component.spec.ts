import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionRequestFormComponent } from './collection-request-form.component';

describe('CollectionRequestFormComponent', () => {
  let component: CollectionRequestFormComponent;
  let fixture: ComponentFixture<CollectionRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionRequestFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
