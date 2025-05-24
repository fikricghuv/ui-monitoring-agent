import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackAnalyticsComponent } from './feedback-analytics.component';

describe('FeedbackAnalyticsComponent', () => {
  let component: FeedbackAnalyticsComponent;
  let fixture: ComponentFixture<FeedbackAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
