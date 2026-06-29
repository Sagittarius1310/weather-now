import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { environment } from '@environments/environment';
import { Location } from '@shared/models/location.model';
import { LocationSearch } from './location-search';

const mockLocations: Location[] = [
    { id: 1, name: 'Stavanger', country: 'Norway', admin1: 'Rogaland', latitude: 58.97005, longitude: 5.73332 },
    { id: 2, name: 'Tallinn', country: 'Estonia', admin1: 'Harju', latitude: 59.43696, longitude: 24.75353 },
];

describe('LocationSearch', () => {
    let service: LocationSearch;
    let httpMock: HttpTestingController;
    let query$: Subject<string>;

    beforeEach(() => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            providers: [
                LocationSearch,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(LocationSearch);
        httpMock = TestBed.inject(HttpTestingController);
        query$ = new Subject<string>();
    });

    afterEach(() => {
        vi.useRealTimers();
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch locations after debounce', async () => {
        const results: Location[] = [];

        service.locationAutocomplete(query$).subscribe(r => results.push(...r));

        query$.next('Sta');
        await vi.advanceTimersByTimeAsync(500);

        const req = httpMock.expectOne(
            `${environment.geocodingApiUrl}?name=Sta&count=5&language=en&format=json`
        );
        req.flush({ results: mockLocations, generationtime_ms: 1 });

        expect(results).toEqual(mockLocations);
    });

    it('should return empty array for blank query', async () => {
        const results: Location[][] = [];

        service.locationAutocomplete(query$).subscribe(r => results.push(r));

        query$.next('   ');
        await vi.advanceTimersByTimeAsync(500);

        httpMock.expectNone(`${environment.geocodingApiUrl}`);
        expect(results[0]).toEqual([]);
    });

    it('should return empty array on HTTP error', async () => {
        const results: Location[][] = [];

        service.locationAutocomplete(query$).subscribe(r => results.push(r));

        query$.next('Sta');
        await vi.advanceTimersByTimeAsync(500);

        const req = httpMock.expectOne(
            `${environment.geocodingApiUrl}?name=Sta&count=5&language=en&format=json`
        );
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

        expect(results[0]).toEqual([]);
    });

    it('should return empty array when API response has no results field', async () => {
        const results: Location[][] = [];

        service.locationAutocomplete(query$).subscribe(r => results.push(r));

        query$.next('Xyz');
        await vi.advanceTimersByTimeAsync(500);

        const req = httpMock.expectOne(
            `${environment.geocodingApiUrl}?name=Xyz&count=5&language=en&format=json`
        );
        req.flush({ generationtime_ms: 1 });

        expect(results[0]).toEqual([]);
    });

    it('should cancel previous request when new query is emitted', async () => {
        const results: Location[][] = [];

        service.locationAutocomplete(query$).subscribe(r => results.push(r));

        query$.next('Sta');
        await vi.advanceTimersByTimeAsync(300);
        query$.next('Stav');
        await vi.advanceTimersByTimeAsync(500);

        const req = httpMock.expectOne(
            `${environment.geocodingApiUrl}?name=Stav&count=5&language=en&format=json`
        );
        req.flush({ results: mockLocations, generationtime_ms: 1 });

        expect(results).toHaveLength(1);
    });
});
