import { Component } from '@angular/core';

import { UnitsControl } from './units-control/units-control';

@Component({
    selector: 'header[app-header]',
    imports: [UnitsControl],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {}
