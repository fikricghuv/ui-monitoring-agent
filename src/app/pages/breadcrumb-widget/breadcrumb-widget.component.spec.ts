import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbWidgetComponent } from './breadcrumb-widget.component';

describe('BreadcrumbWidgetComponent', () => {
  let component: BreadcrumbWidgetComponent;
  let fixture: ComponentFixture<BreadcrumbWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
