export interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1: string;
}

export interface GeocodingApiDto {
    results?: Location[];
    generationtime_ms: number;
}
