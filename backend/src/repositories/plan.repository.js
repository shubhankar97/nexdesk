import { getPlatformModels } from '../config/database.js';

export const findPlans = (filter = {}) => {
  const { Plan } = getPlatformModels();
  return Plan.find(filter).sort({ price: 1 });
};

export const findPlanById = (planId) => {
  const { Plan } = getPlatformModels();
  return Plan.findOne({ planId });
};

export const findPlanBySlug = (slug) => {
  const { Plan } = getPlatformModels();
  return Plan.findOne({ slug });
};

export const createPlan = (data) => {
  const { Plan } = getPlatformModels();
  return Plan.create(data);
};

export const updatePlan = (planId, data) => {
  const { Plan } = getPlatformModels();
  return Plan.findOneAndUpdate({ planId }, data, { new: true, runValidators: true });
};
