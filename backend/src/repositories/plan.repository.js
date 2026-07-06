import { Plan } from '../models/Plan.js';

export const findPlans = (filter = {}) =>
  Plan.find(filter).sort({ price: 1 });

export const findPlanById = (planId) =>
  Plan.findOne({ planId });

export const findPlanBySlug = (slug) =>
  Plan.findOne({ slug: slug.toLowerCase() });

export const createPlan = (data) =>
  Plan.create(data);

export const updatePlan = (planId, data) =>
  Plan.findOneAndUpdate({ planId }, data, { new: true, runValidators: true });
