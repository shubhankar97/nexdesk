import { getTenantModels } from '../context/tenantContext.js';

const requireTenantModels = () => {
  const models = getTenantModels();

  if (!models?.Document) {
    throw new Error('Tenant context required');
  }

  return models;
};

export const findDocuments = (filter = {}) => {
  const { Document } = requireTenantModels();
  return Document.find(filter).sort({ createdAt: -1 });
};

export const findDocumentById = (id) => {
  const { Document } = requireTenantModels();
  return Document.findById(id);
};

export const createDocument = (data) => {
  const { Document } = requireTenantModels();
  return Document.create(data);
};

export const updateDocumentById = (id, data) => {
  const { Document } = requireTenantModels();
  return Document.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteDocumentById = (id) => {
  const { Document } = requireTenantModels();
  return Document.findByIdAndDelete(id);
};
