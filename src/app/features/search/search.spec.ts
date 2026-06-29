import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { LocationSearch } from '@core/services/location-search';
import { Location } from '@shared/models/location.model';
import { Search } from './search';

const mockLocations: Location[] = [
    { id: 1, name: 'Stavanger', country: 'Norway', admin1: 'Rogaland', latitude: 58.97005, longitude: 5.73332 },
    { id: 2, name: 'Tallinn', country: 'Estonia', admin1: 'Harju', latitude: 59.43696, longitude: 24.75353 },
];

const mockLocationWithoutCountry: Location = {
    id: 3,
    name: 'Springfield',
    country: '',
    admin1: 'Illinois',
    latitude: 39.80172,
    longitude: -89.64371,
};


describe('Search', () => {
    let component: Search;
    let fixture: ComponentFixture<Search>;
    let autocomplete$: Subject<Location[]>;

    beforeEach(async () => {
        autocomplete$ = new Subject<Location[]>();

        await TestBed.configureTestingModule({
            imports: [Search],
            providers: [
                {
                    provide: LocationSearch,
                    useValue: { locationAutocomplete: () => autocomplete$ },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Search);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('dropdown', () => {
        it('should be closed initially', () => {
            expect(component['isDropdownOpen']()).toBe(false);
        });

        it('should open when input is focused', () => {
            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            input.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(component['isDropdownOpen']()).toBe(true);
        });

        it('should close when clicking outside the search field', () => {
            component['isDropdownOpen'].set(true);

            const event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: document.body });
            component.onDocumentClick(event);

            expect(component['isDropdownOpen']()).toBe(false);
        });

        it('should stay open when clicking inside the search field', () => {
            component['isDropdownOpen'].set(true);

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            const event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: input });
            component.onDocumentClick(event);

            expect(component['isDropdownOpen']()).toBe(true);
        });

        it('should render suggestion list when open and locations are emitted', () => {
            component['isDropdownOpen'].set(true);
            autocomplete$.next(mockLocations);
            fixture.detectChanges();

            const items = fixture.nativeElement.querySelectorAll('.suggestion');
            expect(items).toHaveLength(2);
        });

        it('should not render suggestion list when there are no locations', () => {
            component['isDropdownOpen'].set(true);
            autocomplete$.next([]);
            fixture.detectChanges();

            const list = fixture.nativeElement.querySelector('#search-results');
            expect(list).toBeNull();
        });

        it('should not render suggestion list when dropdown is closed', () => {
            component['isDropdownOpen'].set(false);
            autocomplete$.next(mockLocations);
            fixture.detectChanges();

            const list = fixture.nativeElement.querySelector('#search-results');
            expect(list).toBeNull();
        });
    });

    describe('selectLocation', () => {
        it('should set selectedLocation', () => {
            component['selectLocation'](mockLocations[0]);
            expect(component['selectedLocation']()).toEqual(mockLocations[0]);
        });

        it('should close the dropdown', () => {
            component['isDropdownOpen'].set(true);
            component['selectLocation'](mockLocations[0]);
            expect(component['isDropdownOpen']()).toBe(false);
        });

        it('should format input value as "name, country"', () => {
            component['selectLocation'](mockLocations[0]);
            expect(component['searchInput'].value).toBe('Stavanger, Norway');
        });

        it('should omit country from input value when country is empty', () => {
            component['selectLocation'](mockLocationWithoutCountry);
            expect(component['searchInput'].value).toBe('Springfield');
        });

        it('should not trigger valueChanges when setting input value', () => {
            const spy = vi.fn();
            component['searchInput'].valueChanges.subscribe(spy);
            component['selectLocation'](mockLocations[0]);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('selectedLocation reset', () => {
        it('should reset selectedLocation to null when autocomplete emits', () => {
            component['selectedLocation'].set(mockLocations[0]);
            autocomplete$.next(mockLocations);
            expect(component['selectedLocation']()).toBeNull();
        });
    });

    describe('keyboard interaction', () => {
        beforeEach(() => {
            component['isDropdownOpen'].set(true);
            autocomplete$.next(mockLocations);
            fixture.detectChanges();
        });

        it('should select location on Enter key', () => {
            const firstItem: HTMLElement = fixture.nativeElement.querySelector('.suggestion');
            firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(component['selectedLocation']()).toEqual(mockLocations[0]);
        });

        it('should select location on Space key', () => {
            const firstItem: HTMLElement = fixture.nativeElement.querySelector('.suggestion');
            firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            expect(component['selectedLocation']()).toEqual(mockLocations[0]);
        });
    });

    describe('aria-expanded', () => {
        it('should be false when dropdown is closed', () => {
            component['isDropdownOpen'].set(false);
            fixture.detectChanges();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.getAttribute('aria-expanded')).toBe('false');
        });

        it('should be true when dropdown is open and locations exist', () => {
            component['isDropdownOpen'].set(true);
            autocomplete$.next(mockLocations);
            fixture.detectChanges();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.getAttribute('aria-expanded')).toBe('true');
        });

        it('should be false when dropdown is open but no locations', () => {
            component['isDropdownOpen'].set(true);
            autocomplete$.next([]);
            fixture.detectChanges();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.getAttribute('aria-expanded')).toBe('false');
        });
    });
});
