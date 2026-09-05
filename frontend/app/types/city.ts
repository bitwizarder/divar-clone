import { State } from "./state";

export interface City {
  id: number;
  name: string;
  states?: State[] | [];
  status: number; // 0 = غیرفعال, 1 = فعال
}

export interface CityResponse {
  data: City;
}
export interface CityEditFormProps {
  state: City;
  states: City[];
}
export interface CityListResponse {
  data: City[];
}
