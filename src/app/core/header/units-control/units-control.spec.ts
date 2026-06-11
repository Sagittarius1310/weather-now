import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsControl } from './units-control';

describe('UnitsControl', () => {
    let component: UnitsControl;
    let fixture: ComponentFixture<UnitsControl>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UnitsControl],
        }).compileComponents();

        fixture = TestBed.createComponent(UnitsControl);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
