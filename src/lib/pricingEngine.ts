import { PriceItem } from './db';

export interface MoveDetails {
    distance: number; // km
    floors: number; // average floors or total floors
    hasElevator: boolean;
    workers: number;
    hours: number;
}

export interface CalculatedCost {
    totalVolume: number; // m3
    totalTime: number; // hours
    transportCost: number;
    workerCost: number;
    materialCost: number; // boxes etc
    total: number;
}

export class PricingEngine {
    private priceList: PriceItem[];

    constructor(priceList: PriceItem[]) {
        this.priceList = priceList;
    }

    calculateVolume(items: { itemId: string; quantity: number }[]): number {
        let totalVolume = 0;
        items.forEach(item => {
            const priceItem = this.priceList.find(p => p.id === item.itemId);
            if (priceItem && priceItem.volume) {
                totalVolume += priceItem.volume * item.quantity;
            }
        });
        return totalVolume;
    }

    calculateMoveCost(items: { itemId: string; quantity: number }[], details: MoveDetails): CalculatedCost {
        const totalVolume = this.calculateVolume(items);

        // Basic logic for time estimation (can be refined)
        // e.g., 1 m3 takes ~0.5 hours for 1 worker? This is a placeholder logic.
        const baseTimePerM3 = 0.5;
        let estimatedHours = (totalVolume * baseTimePerM3) / details.workers;

        // Add time for floors if no elevator
        if (!details.hasElevator) {
            estimatedHours *= (1 + (details.floors * 0.1)); // 10% more time per floor
        }

        // Add driving time (e.g., 50km/h avg)
        const drivingHours = details.distance / 50;
        const totalTime = Math.max(details.hours, estimatedHours + drivingHours);

        // Costs
        // Hamburg Market Adjustment (109% logic placeholder)
        const marketMultiplier = 1.09;

        const workerRate = 35; // EUR/hour/worker (example)
        const truckRate = 50; // EUR/hour (example)

        const workerCost = totalTime * details.workers * workerRate * marketMultiplier;
        const transportCost = (totalTime * truckRate) + (details.distance * 0.5); // 0.5 EUR/km fuel

        // Material/Item costs (assembly etc)
        let materialCost = 0;
        items.forEach(item => {
            const priceItem = this.priceList.find(p => p.id === item.itemId);
            if (priceItem) {
                // Add base price of items if they are materials (boxes)
                if (priceItem.unit === 'item') {
                    materialCost += priceItem.basePrice * item.quantity;
                }
                // Add assembly costs if applicable (logic to be added)
            }
        });

        return {
            totalVolume,
            totalTime,
            transportCost,
            workerCost,
            materialCost,
            total: workerCost + transportCost + materialCost
        };
    }
}
