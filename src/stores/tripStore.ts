import { create } from 'zustand';
import type { Trip } from '@/data/types';
import { tripRepo } from '@/data/repositories';

interface TripWithStats extends Trip {
  billCount: number;
  totalSpent: number;
}

interface TripStore {
  trips: TripWithStats[];
  loading: boolean;
  loadTrips: () => Promise<void>;
  createTrip: (name: string, coverColor: string, startDate?: string, endDate?: string) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  loading: false,

  loadTrips: async () => {
    set({ loading: true });
    const trips = await tripRepo.getAll();
    const tripsWithStats: TripWithStats[] = await Promise.all(
      trips.map(async (trip) => ({
        ...trip,
        billCount: await tripRepo.getBillCount(trip.id),
        totalSpent: await tripRepo.getTotalSpent(trip.id),
      }))
    );
    set({ trips: tripsWithStats, loading: false });
  },

  createTrip: async (name, coverColor, startDate, endDate) => {
    const trip = await tripRepo.create({ name, coverColor, startDate, endDate });
    await get().loadTrips();
    return trip;
  },

  deleteTrip: async (id) => {
    await tripRepo.softDelete(id);
    await get().loadTrips();
  },
}));
