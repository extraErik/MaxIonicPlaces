import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New York City',
//     'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg',
//     149.99,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'xyz'
//   ),
//   new Place(
//     'p2',
//     'L\'Amour Toujours',
//     'A romatic place in Paris',
//     'https://www.parisperfect.com/g/photos/upload/sml_910679281-1496241966-romantic-retreats-vacation-rentals-paris.jpg',
//     189.99,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The Foggy Palace',
//     'Not your average city trip!',
//     'https://cdn1.foap.com/images/71900230-994f-4d00-8200-304b40bf18c0/w640.jpg?1552030898',
//     99.99,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.http.get<{[key: string]: PlaceData }>('https://maxionicplaces.firebaseio.com/offered-places.json')
    .pipe(
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
            ));
          }
        }
        return places;
      }),
      delay(2000),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return {...places.find(p => p.id === id)};
      }))
    ;
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http.post<{name: string}>('https://maxionicplaces.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // return this.places.pipe(
    //   take(1),
    //   delay(1500),
    //   tap(places => {
    //     this._places.next(places.concat(newPlace)
    //   );
    // }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
      );
      this._places.next(updatedPlaces);
    }));
  }

}
