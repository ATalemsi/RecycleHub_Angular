import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherDisplayComponent } from './voucher-display.component';

describe('VoucherDisplayComponent', () => {
  let component: VoucherDisplayComponent;
  let fixture: ComponentFixture<VoucherDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoucherDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
