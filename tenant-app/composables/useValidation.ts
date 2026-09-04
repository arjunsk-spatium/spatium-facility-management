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

       const errObj = error.data?.error || error.error;
       if ((errObj?.type === 'VALIDATION' || errObj?.type === 'VALIDATION_ERROR') && errObj?.fields) {
         const fields = errObj.fields;
         for (const key in fields) {
           if (Array.isArray(fields[key]) && fields[key].length > 0 && fields[key][0]?.message) {
             return fields[key][0].message;
           }
         }
       }

       const message = error.data?.message || error.message;
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
