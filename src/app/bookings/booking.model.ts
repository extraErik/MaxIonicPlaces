export class Booking {
  constructor(
    public id: string,
    public placeId: string,
    public userId: string,
    public placeTitle: string,
    public placeImag: string,
    public firstName: string,
    public lasName: string,
    public guestNumber: number,
    public bookedFrom: Date,
    public bookdTo: Date
  ) {}
}
