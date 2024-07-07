export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface ILocationPresence {
  locationCheckIn: ILocation;
  locationCheckOut: ILocation;
}
