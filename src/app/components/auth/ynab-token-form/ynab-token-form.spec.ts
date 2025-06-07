import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {YnabTokenForm} from './ynab-token-form';

describe('YnabTokenForm', () => {
  let component: YnabTokenForm;
  let fixture: ComponentFixture<YnabTokenForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YnabTokenForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(YnabTokenForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
