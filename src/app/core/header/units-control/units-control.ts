import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TemperatureUnit, WindSpeedUnit, PrecipitationUnit } from '@shared/enums/units.enum';

@Component({
    selector: 'app-units-control',
    imports: [FormsModule],
    templateUrl: './units-control.html',
    styleUrl: './units-control.scss',
    host: { class: 'units-control' },
})
export class UnitsControl {
    // DOM reference
    private readonly elementRef = inject(ElementRef);

    // Expose the enums to the template
    protected readonly TemperatureUnit = TemperatureUnit;
    protected readonly WindSpeedUnit = WindSpeedUnit;
    protected readonly PrecipitationUnit = PrecipitationUnit;

    // Dropdown state
    protected isOpen = false;

    // Selected units
    protected selectedTemp = TemperatureUnit.Celsius;
    protected selectedWindSpeed = WindSpeedUnit.KmH;
    protected selectedPrecipitation = PrecipitationUnit.Millimeters;

    // Close dropdown on click outside of it
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target && !this.elementRef.nativeElement.contains(target)) {
            this.isOpen = false;
        }
    }

    protected toggleDropdown(): void {
        this.isOpen = !this.isOpen;
    }

    protected toggleUnits(): void {
        if (this.isMetric) {
            this.selectedTemp = TemperatureUnit.Fahrenheit;
            this.selectedWindSpeed = WindSpeedUnit.Mph;
            this.selectedPrecipitation = PrecipitationUnit.Inches;
        } else {
            this.selectedTemp = TemperatureUnit.Celsius;
            this.selectedWindSpeed = WindSpeedUnit.KmH;
            this.selectedPrecipitation = PrecipitationUnit.Millimeters;
        }
    }

    protected get toggleButtonText(): string {
        return this.isMetric ? 'Switch to Imperial' : 'Switch to Metric';
    }

    private get isMetric(): boolean {
        return (
            this.selectedTemp === TemperatureUnit.Celsius &&
            this.selectedWindSpeed === WindSpeedUnit.KmH &&
            this.selectedPrecipitation === PrecipitationUnit.Millimeters
        );
    }
}
