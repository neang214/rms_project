import { Coffee, GlassWater, ChefHat, UtensilsCrossed } from "lucide-react"

export const KITCHEN = {
  role: "kitchen",
  type: "food",                 
  pageTitleKey: "station.kitchenPageTitle",
  headerKey: "station.kitchenHeader",
  subtitleKey: "station.foodOnly",
  queueKey: "kitchenQueue",     
  fetchKey: "fetchKitchenQueue",
  icons: { header: UtensilsCrossed, empty: ChefHat, card: UtensilsCrossed, all: UtensilsCrossed },
  labels: { startActionKey: "station.startCooking", preparingKey: "status.cooking", statNowKey: "station.cookingNow" },
  fallbackImg: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop",
}

export const BARISTA = {
  role: "barista",
  type: "drink",
  pageTitleKey: "station.baristaPageTitle",
  headerKey: "station.baristaHeader",
  subtitleKey: "station.drinkOnly",
  queueKey: "baristaQueue",
  fetchKey: "fetchBaristaQueue",
  icons: { header: Coffee, empty: Coffee, card: Coffee, all: GlassWater },
  labels: { startActionKey: "station.startMaking", preparingKey: "status.making", statNowKey: "station.makingNow" },
  fallbackImg: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop",
}
