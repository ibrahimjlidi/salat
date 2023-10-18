import { Component, OnInit } from '@angular/core';
import { PrayerTimeService } from './prayer-time.service';
import { DatePipe } from '@angular/common';
import { interval,Subscription  } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  prayerTimings: any = {};
  currentDateTime: string = '';
  selectedCityDisplayName: string = '';
  nextPrayerTitle: string = '';
  timeRemaining: string = '';
  
  private timerSubscription: Subscription = new Subscription;
  cities = [
    { displayName: "تطاوين", apiName: "tataouine" },
    { displayName: "مدنين", apiName: "Médenine" },
    { displayName: "قابس", apiName: "Gabès" },
    { displayName: "قبلي", apiName: "kébili" }
  ];
  selectedCity: string = '';
  randomImageUrl: string = 'https://via.placeholder.com/150'; // Default image URL

  constructor(private prayerTimeService: PrayerTimeService, public datepipe: DatePipe, private http: HttpClient) { }
  cards: any[] = [
    {
      imageUrl: this.randomImageUrl,
      title: 'الفجر',
    },
    {
      imageUrl: this.randomImageUrl,
      title: 'الظهر',
      details: 'Details about Dhuhr.'
    },
    {
      imageUrl: this.randomImageUrl,
      title: 'العصر',
      details: 'Details about Asr.'
    },
    {
      imageUrl: this.randomImageUrl,
      title: 'المغرب',
      details: 'Details about Maghrib.'
    },
    {
      imageUrl: this.randomImageUrl,
      title: 'العشاء',
      details: 'Details about Isha.'
    },
  ];

  ngOnInit(): void {
    interval(1000).subscribe(() => {
      this.currentDateTime = new Intl.DateTimeFormat('ar-TN', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(Date.now());
    });

    this.selectedCity = this.cities[0].apiName;
    this.selectedCityDisplayName = this.cities[0].displayName;
    this.getPrayerTimings();
  }

  onCityChange() {
    const selectedCityObject = this.cities.find(city => city.apiName === this.selectedCity);
    if (selectedCityObject) {
      this.selectedCityDisplayName = selectedCityObject.displayName;
    }
    this.getPrayerTimings();
  }

  getPrayerTimings(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const country = 'TU';
    const city = this.selectedCity.toLowerCase();

    this.prayerTimeService.getPrayerTimings(formattedDate, country, city).subscribe(data => {
      this.prayerTimings = {
        'الفجر': data.data.timings.Fajr,
        'الظهر': data.data.timings.Dhuhr,
        'العصر': data.data.timings.Asr,
        'المغرب': data.data.timings.Maghrib,
        'العشاء': data.data.timings.Isha,
      };
      this.updateNextPrayer();
    });
  }

  updateNextPrayer(): void {
    // Clear existing timer if it exists
    if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
    }

    const keys = Object.keys(this.prayerTimings);
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (let i = 0; i < keys.length - 1; i++) {
        const currentPrayerKey = keys[i];
        const nextPrayerKey = keys[i + 1];
        const currentPrayerTime = this.prayerTimings[currentPrayerKey];
        const nextPrayerTime = this.prayerTimings[nextPrayerKey];

        if (currentTime >= currentPrayerTime && currentTime < nextPrayerTime) {
            // Calculate time remaining until the next prayer in seconds
            const currentTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes();
            const nextPrayerTimeInMinutes = parseInt(nextPrayerTime.split(':')[0]) * 60 + parseInt(nextPrayerTime.split(':')[1]);
            let remainingSeconds = (nextPrayerTimeInMinutes - currentTimeInMinutes) * 60;

            // Start a new timer
            this.timerSubscription = interval(1000).subscribe(() => {
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
                this.timeRemaining = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                remainingSeconds--;

                // If remainingSeconds is negative or zero, reset it to the total seconds until the next prayer
                if (remainingSeconds <= 0) {
                    remainingSeconds = (nextPrayerTimeInMinutes - currentTimeInMinutes) * 60;
                }
            });

            // Update nextPrayerTitle
            this.nextPrayerTitle = nextPrayerKey;
            break;
        }
    }
}
ngOnDestroy(): void {
  if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
  }
}
}



