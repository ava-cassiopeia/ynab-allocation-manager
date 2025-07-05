import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoadingIcon} from './loading-icon';

describe('LoadingIcon', () => {
  let component: LoadingIcon;
  let fixture: ComponentFixture<LoadingIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingIcon],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoadingIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
