import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Clipboard} from '@angular/cdk/clipboard';

import {CurrencyCopyButton} from './currency-copy-button';

describe('CurrencyCopyButton', () => {
  let component: CurrencyCopyButton;
  let fixture: ComponentFixture<CurrencyCopyButton>;
  let clipboard: Clipboard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyCopyButton],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Clipboard,
          useValue: {copy: jasmine.createSpy('copy')},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyCopyButton);
    component = fixture.componentInstance;
    clipboard = TestBed.inject(Clipboard);
    fixture.componentRef.setInput('milliunits', 10000);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy the currency value to the clipboard', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clipboard.copy).toHaveBeenCalledWith('10');
  });

  it('should reset the copied state after a timeout', (done) => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    let activeIcon = fixture.nativeElement.querySelector('.icons.active .active');
    expect(activeIcon).toBeTruthy();

    setTimeout(() => {
      fixture.detectChanges();
      activeIcon = fixture.nativeElement.querySelector('.icons.active .active');
      expect(activeIcon).toBeFalsy();
      done();
    }, 2000);
  });
});
