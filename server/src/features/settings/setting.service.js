import mongoose from 'mongoose';
import { Setting } from './setting.model.js';

let memorySettings = {
  _id: 'default-settings',
  siteName: 'Atelier AI Haute Couture',
  contactEmail: 'concierge@atelierraffinement.com',
  contactPhone: '0300-1234567',
  stripeEnabled: true,
  jazzCashEnabled: true,
  easyPaisaEnabled: true,
  currency: 'PKR',
  freeShippingThreshold: 10000,
  updatedAt: new Date(),
};

export const getSettingsService = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create(memorySettings);
      }
      return settings;
    } catch (e) {
      console.warn('[Settings DB Fallback]:', e.message);
    }
  }
  return memorySettings;
};

export const updateSettingsService = async (updateData) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({ ...memorySettings, ...updateData });
      } else {
        Object.assign(settings, updateData);
        await settings.save();
      }
      memorySettings = settings.toObject();
      return settings;
    } catch (e) {
      console.warn('[Settings DB Update Fallback]:', e.message);
    }
  }

  memorySettings = {
    ...memorySettings,
    ...updateData,
    updatedAt: new Date(),
  };
  return memorySettings;
};
