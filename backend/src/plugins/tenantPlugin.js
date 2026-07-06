import { getTenantId } from '../context/tenantContext.js';

/**
 * Mongoose plugin for shared-database multi-tenancy.
 * Automatically scopes queries and writes to the current tenant when tenantId is set in context.
 */
export const tenantPlugin = (schema, options = {}) => {
  const { required = true } = options;

  schema.add({
    tenantId: {
      type: String,
      index: true,
      required,
    },
  });

  const queryMiddleware = function applyTenantFilter() {
    const tenantId = getTenantId();

    if (tenantId) {
      this.where({ tenantId });
    }
  };

  const writeMiddleware = function enforceTenantOnWrite() {
    const tenantId = getTenantId();

    if (!tenantId) {
      return;
    }

    const filter = this.getFilter();

    if (!filter.tenantId) {
      this.where({ tenantId });
    }
  };

  schema.pre(
    ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'countDocuments'],
    queryMiddleware
  );

  schema.pre(['updateOne', 'updateMany', 'deleteOne', 'deleteMany'], writeMiddleware);

  schema.pre('validate', function assignTenantOnValidate(next) {
    if (this.tenantId) {
      return next();
    }

    const tenantId = getTenantId();

    if (tenantId) {
      this.tenantId = tenantId;
      return next();
    }

    if (required) {
      return next(new Error('tenantId is required'));
    }

    return next();
  });

  schema.pre('aggregate', function scopeAggregate() {
    const tenantId = getTenantId();

    if (tenantId) {
      this.pipeline().unshift({ $match: { tenantId } });
    }
  });
};

export const applyTenantPlugin = (schema, options) => {
  schema.plugin(tenantPlugin, options);
};
