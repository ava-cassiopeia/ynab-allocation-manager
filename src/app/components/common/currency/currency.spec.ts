import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {Currency} from './currency';
import {CurrencyFormat, SettingsStorage} from '../../../../lib/firebase/settings_storage';
import {sleep} from '../../../../lib/tests/sleep';
import {FakeAuthStorage, fakeAuthStorageProvider} from '../../../../lib/tests/fake_auth_storage';

describe('Currency', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Currency],
      providers: [
        provideZonelessChangeDetection(),
        fakeAuthStorageProvider,
      ],
    })
      .compileComponents();
  });

  it('should create', () => {
    const {component} = createComponent(1000);
    expect(component).toBeTruthy();
  });

  it('should render an appropriate fractional amount', () => {
    const {fixture} = createComponent(1234);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('$1.23');
  });

  it('should render negative values with the - before the currency symbol', () => {
    const {fixture} = createComponent(-1234);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('-$1.23');
  });

  it('should show two digits for even fractionals', () => {
    const {fixture} = createComponent(1200);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('$1.20');
  });

  it('should render an appropriate amount for a very small amount', () => {
    const {fixture} = createComponent(345);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('$0.35');
  });

  it('should render an appropriate amount for a small amount', () => {
    const {fixture} = createComponent(12345);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('$12.35');
  });

  it('should render an appropriate amount for a large amount', () => {
    const {fixture} = createComponent(123450000);
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('$123,450.00');
  });

  it("respects the user's currency format settings", async () => {
    const settingsStorage = TestBed.inject(SettingsStorage);
    const fakeAuthStorage = TestBed.inject(FakeAuthStorage);
    await fakeAuthStorage.createFakeUser();
    await settingsStorage.setCurrencyFormat(CurrencyFormat.FINANCE);
    await sleep(10); // wait for Firestore to update
    const {fixture} = createComponent(-123450000);

    const renderedText = fixture.nativeElement.textContent.trim() as string;

    expect(renderedText).toEqual('($123,450.00)');
  });

  // Spot check some non-USD currencies to make sure they render well.

  it('should render INR values', () => {
    const {fixture} = createComponent(123450000, 'INR');
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('₹123,450.00');
  });

  it('should render CAD values', () => {
    const {fixture} = createComponent(123450000, 'CAD');
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('CA$123,450.00');
  });

  it('should render EUR values', () => {
    const {fixture} = createComponent(123450000, 'EUR');
    const renderedText = fixture.nativeElement.textContent.trim() as string;
    expect(renderedText).toEqual('€123,450.00');
  });

  function createComponent(milliunits: number, currency = 'USD') {
    const fixture = TestBed.createComponent(Currency);
    fixture.componentRef.setInput('milliunits', milliunits);
    fixture.componentRef.setInput('currencyOverride', currency);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
    };
  }
});
