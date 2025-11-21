// src/app/vacation/vacation.component.spec.ts
/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacationComponent } from './vacation.component';

describe('VacationComponent', () => {
  let component: VacationComponent;
  let fixture: ComponentFixture<VacationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VacationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VacationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

