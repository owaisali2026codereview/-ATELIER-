import { getSettingsService, updateSettingsService } from './setting.service.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsService();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updated = await updateSettingsService(req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'System settings updated and persisted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
