import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DropdownButton} from './dropdown-button';

describe('DropdownButton', () => {
  let component: DropdownButton;
  let fixture: ComponentFixture<DropdownButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownButton]
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
