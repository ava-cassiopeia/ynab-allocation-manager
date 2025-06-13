import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DropdownButton} from './dropdown-button';

describe('DropdownButton', () => {
  let component: DropdownButton<any>;
  let fixture: ComponentFixture<DropdownButton<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownButton],
      providers: [provideZonelessChangeDetection()],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DropdownButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
