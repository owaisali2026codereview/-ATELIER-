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
  codEnabled: true,
  currency: 'PKR',
  freeShippingThreshold: 10000,
  updatedAt: new Date(),
};

export const getSettingsService = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      let settings = await Setting.findOne();
      if (!settings) {
        const initial = { ...memorySettings };
        delete initial._id;
        settings = await Setting.create(initial);
      }
      if (settings) {
        memorySettings = settings.toObject();
        return settings;
      }
    } catch (e) {
      console.warn('[Settings DB Fallback]:', e.message);
    }
  }
  return memorySettings;
};

export const updateSettingsService = async (rawUpdateData = {}) => {
  const updateData = { ...rawUpdateData };
  delete updateData._id;
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.__v;

  if (updateData.siteName) updateData.siteName = String(updateData.siteName).trim();
  if (updateData.contactEmail) updateData.contactEmail = String(updateData.contactEmail).trim();
  if (updateData.contactPhone) updateData.contactPhone = String(updateData.contactPhone).trim();

  if (updateData.stripeEnabled !== undefined) updateData.stripeEnabled = Boolean(updateData.stripeEnabled);
  if (updateData.jazzCashEnabled !== undefined) updateData.jazzCashEnabled = Boolean(updateData.jazzCashEnabled);
  if (updateData.easyPaisaEnabled !== undefined) updateData.easyPaisaEnabled = Boolean(updateData.easyPaisaEnabled);
  if (updateData.codEnabled !== undefined) updateData.codEnabled = Boolean(updateData.codEnabled);

  if (mongoose.connection.readyState === 1) {
    try {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create(updateData);
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
