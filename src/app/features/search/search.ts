import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';

import { LocationSearch } from '@core/services/location-search';
import { Location } from '@shared/models/location.model';

@Component({
    selector: 'app-search',
    imports: [ReactiveFormsModule],
    templateUrl: './search.html',
    styleUrl: './search.scss',
    host: { class: 'search' }
})
export class Search {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly locationSearch = inject(LocationSearch);

    private readonly searchFieldElement = viewChild<ElementRef<HTMLElement>>('searchField');

    protected readonly searchInput = new FormControl<string>('', { nonNullable: true });
    protected readonly isDropdownOpen = signal(false);
    protected readonly selectedLocation = signal<Location | null>(null);
    protected readonly locations = toSignal(
        this.locationSearch.locationAutocomplete(this.searchInput.valueChanges).pipe(
            tap(() => this.selectedLocation.set(null))
        ),
        { initialValue: [] }
    );

    protected selectLocation(location: Location): void {
        const parts = [location.name, location.country].filter(Boolean);
        this.selectedLocation.set(location);
        this.searchInput.setValue(parts.join(', '), { emitEvent: false });
        this.isDropdownOpen.set(false);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!isPlatformBrowser(this.platformId)) return;
        
        const target = event.target as HTMLElement | null;
        if (target && !this.searchFieldElement()?.nativeElement.contains(target)) {
            this.isDropdownOpen.set(false);
        }
    }

    protected openDropdown(): void {
        this.isDropdownOpen.set(true);
    }
}
