import { Injectable } from '@angular/core';

import { Booking } from './booking.model';
import { BehaviorSubject, pipe } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random.toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http.post<{ name: string }>(
      'https://maxionicplaces.firebaseio.com/bookings.json',
      { ...newBooking, id: null }
    ).pipe(
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(
        bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        }
      )
    );
  }
  
}