export const useValidation = () => {
  const isValidEmail = (email: string): boolean => {
    // Strict email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const sanitizeError = (error: any): string => {
    // If it's an object with a message, return that.
    // Check common error structures (e.g. Nuxt/Fetch errors often have data.message)
    if (error) {
       if (typeof error === 'string') return error;

       const container = error.data || error;
       const errObj = container?.error || error.error;

       // Pull the first human-readable message out of a field error map
       // ({ fields: {...} } or { details: {...} }, values may be strings,
       // string arrays, or [{ message }] objects)
       const collectFrom = (source: any): string | null => {
         if (!source) return null;
         for (const key in source) {
           const value = source[key];
           if (Array.isArray(value)) {
             const first = value.find(v => (typeof v === 'string' && v) || (v && typeof v.message === 'string' && v.message));
             if (first) return typeof first === 'string' ? first : first.message;
           } else if (typeof value === 'string' && value) {
             return value;
           }
         }
         return null;
       };

       if (errObj) {
         const fromFields = collectFrom(errObj.fields);
         if (fromFields) return fromFields;
         const fromDetails = collectFrom(errObj.details);
         if (fromDetails) return fromDetails;
         if (typeof errObj.message === 'string' && errObj.message) return errObj.message;
       }

       const message = container?.message || error.message;
       if (message && typeof message === 'string') {
         return message;
       }
    }
    return 'An unexpected error occurred';
  };

  const getValidationErrors = (error: any): string[] => {
    const errors: string[] = [];
    const fields = error?.data?.error?.fields || error?.error?.fields;
    if (fields) {
      for (const key in fields) {
        if (Array.isArray(fields[key])) {
          fields[key].forEach((err: any) => {
            if (err?.message) {
              errors.push(`${key}: ${err.message}`);
            }
          });
        }
      }
    }
    return errors;
  };

  return {
    isValidEmail,
    sanitizeError,
    getValidationErrors
  };
};
