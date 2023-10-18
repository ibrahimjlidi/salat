import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrayerTimeService {
  private apiUrl = 'https://api.aladhan.com/v1/timingsByCity';

  constructor(private http: HttpClient) { }

  getPrayerTimings(date: string, country: string, city: string): Observable<any> {
    
    const url = `${this.apiUrl}/${date}?country=${country}&city=${city}`;
    return this.http.get(url);
  }
}
