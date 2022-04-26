import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabIconComponent } from './tab-icon.component';

describe('TabIconComponent', () => {
  let component: TabIconComponent;
  let fixture: ComponentFixture<TabIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
