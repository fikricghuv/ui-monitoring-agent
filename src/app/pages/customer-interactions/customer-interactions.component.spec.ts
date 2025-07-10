import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInteractionsComponent } from './customer-interactions.component';

describe('CustomerInteractionsComponent', () => {
  let component: CustomerInteractionsComponent;
  let fixture: ComponentFixture<CustomerInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInteractionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
