import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { environment } from '@environments/environment';
import { Location, GeocodingApiDto } from '@shared/models/location.model';

@Service()
export class LocationSearch {
    private readonly http = inject(HttpClient);
    private readonly geocodingApiUrl = environment.geocodingApiUrl;

    public locationAutocomplete(query$: Observable<string>): Observable<Location[]> {
        return query$.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(query => 
                query.trim()
                    ? this.fetchLocations(query)
                    : of([])
            )
        );
    }

    private fetchLocations(query: string): Observable<Location[]> {
        return this.http.get<GeocodingApiDto>(`${this.geocodingApiUrl}?name=${query}&count=5&language=en&format=json`)
            .pipe(
                map(payload => payload.results ?? []),
                catchError(() => of([]))
            );
    }
}
