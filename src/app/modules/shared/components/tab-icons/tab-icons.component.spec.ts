import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabIconsComponent } from './tab-icons.component';

describe('TabIconsComponent', () => {
  let component: TabIconsComponent;
  let fixture: ComponentFixture<TabIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabIconsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
