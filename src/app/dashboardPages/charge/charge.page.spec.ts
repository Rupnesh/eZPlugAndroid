import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargePage } from './charge.page';

describe('ChargePage', () => {
  let component: ChargePage;
  let fixture: ComponentFixture<ChargePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
