import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vacation } from './vacation';

describe('Vacation', () => {
  let component: Vacation;
  let fixture: ComponentFixture<Vacation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vacation]
    }).compileComponents();

    fixture = TestBed.createComponent(Vacation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
