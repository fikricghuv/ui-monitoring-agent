import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseKnowledgeComponent } from './base-knowledge.component';

describe('BaseKnowledgeComponent', () => {
  let component: BaseKnowledgeComponent;
  let fixture: ComponentFixture<BaseKnowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseKnowledgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseKnowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
