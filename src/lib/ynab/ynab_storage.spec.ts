import {provideZonelessChangeDetection} from "@angular/core";
import {TestBed} from "@angular/core/testing";

import {YnabStorage} from "./ynab_storage";

describe("YnabStorage", () => {
  let ynabStorage: YnabStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
      ],
    });

    ynabStorage = TestBed.inject(YnabStorage);
    sessionStorage.clear();
  });

  it("should be created", () => {
    expect(ynabStorage).toBeTruthy();
  });

  it("should save apiKey to sessionStorage when set", () => {
    ynabStorage.apiKey.set("my-key");
    TestBed.tick();
    expect(sessionStorage.getItem("ynab.apiKey")).toBe("my-key");

    ynabStorage.apiKey.set(null);
    TestBed.tick();
    expect(sessionStorage.getItem("ynab.apiKey")).toBeNull();
  });

  it("should initialize the API when an API key is set", () => {
    ynabStorage.apiKey.set("my-key");
    TestBed.tick();

    expect(ynabStorage.api()).not.toBeNull();
  });
});
